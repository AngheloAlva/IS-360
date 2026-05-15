import { addDays, format, getDaysInMonth, subDays } from "date-fns"
import { NextResponse } from "next/server"
import { toZonedTime } from "date-fns-tz"

import type { NextRequest } from "next/server"

import { calculateNextDate } from "@/project/maintenance-plan/utils/calculate-next-date"
import { WorkOrderStatusLabels } from "@/lib/consts/work-order-status"
import { ACTIVITY_TYPE, MODULES } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { resend } from "@/lib/resend"
import prisma from "@/lib/prisma"

import { sendAutomatedWorkOrderEmailsWithFallback } from "@/project/work-order/actions/sendAutomatedWorkOrderEmails"
import { generateOTNumber } from "@/project/work-order/actions/generateOTNumber"

export async function GET(request: NextRequest) {
	try {
		const cronHeader = request.headers.get("x-vercel-cron")
		const authorizationHeader = request.headers.get("authorization")
		const cronSecret = process.env.CRON_SECRET

		const isVercelCron = cronHeader === "1"
		const hasValidSecret = Boolean(cronSecret) && authorizationHeader === `Bearer ${cronSecret}`

		if (!isVercelCron && !hasValidSecret) {
			return NextResponse.json({ success: false, message: "No autorizado" }, { status: 401 })
		}

		const chileTimezone = "America/Santiago"
		const nowInChile = toZonedTime(new Date(), chileTimezone)

		const todayYear = nowInChile.getFullYear()
		const todayMonth = nowInChile.getMonth()
		const todayDay = nowInChile.getDate()

		const today = new Date(todayYear, todayMonth, todayDay)

		const allAutomatedTasks = await prisma.maintenancePlanTask.findMany({
			where: {
				isActive: true,
				maintenancePlan: {
					isActive: true,
				},
				isAutomated: true,
				automatedSupervisorId: {
					not: null,
				},
			},
			include: {
				equipment: true,
				equipments: true,
				createdBy: true,
			},
		})

		console.log(`[CRON DEBUG] Found ${allAutomatedTasks.length} automated tasks. Processing...`)

		const automatedTasks = allAutomatedTasks.filter((task) => {
			const taskDate = toZonedTime(task.nextDate, chileTimezone)
			const taskYear = taskDate.getFullYear()
			const taskMonth = taskDate.getMonth()
			const taskDay = taskDate.getDate()

			const scheduledDate = new Date(taskYear, taskMonth, taskDay)

			const activationDate = subDays(scheduledDate, task.automatedDaysInAdvance ?? 5)

			const shouldInclude = today >= activationDate

			if (shouldInclude) {
				console.log(`[CRON MATCH] Task "${task.name}" matches criteria.`, {
					nextDate: format(task.nextDate, "dd-MM-yyyy"),
					scheduledDate: format(scheduledDate, "dd-MM-yyyy"),
					activationDate: format(activationDate, "dd-MM-yyyy"),
				})
			}

			return shouldInclude
		})

		const createdWorkOrders = []
		const skippedTasks = []
		const blockedTasks = []
		const errors = []

		for (const task of automatedTasks) {
			try {
				const responsibleId = task.automatedResponsibleId ?? task.createdBy.id

				const taskEquipments =
					task.equipments.length > 0 ? task.equipments : task.equipment ? [task.equipment] : []

				if (taskEquipments.length === 0) {
					errors.push({
						taskName: task.name,
						error: "La tarea no tiene equipos asociados",
					})
					continue
				}

				const taskDate = toZonedTime(task.nextDate, chileTimezone)
				const scheduledDate = new Date(
					taskDate.getFullYear(),
					taskDate.getMonth(),
					taskDate.getDate()
				)

				// Check if work order already exists for this task and scheduled date
				const existingWorkOrder = await prisma.workOrder.findFirst({
					where: {
						maintenancePlanTaskId: task.id,
						programDate: scheduledDate,
						deletedAt: null,
					},
				})

				if (existingWorkOrder) {
					const nextDate = calculateNextDate(scheduledDate, task.frequency, task.originalDayOfMonth)

					await prisma.maintenancePlanTask.update({
						where: { id: task.id },
						data: { nextDate },
					})

					console.log(
						`[CRON SKIP] Work order already exists for task "${task.name}" on ${format(scheduledDate, "dd-MM-yyyy")} (OT: ${existingWorkOrder.otNumber})`
					)
					skippedTasks.push({
						taskName: task.name,
						reason: "Work order already exists",
						existingOtNumber: existingWorkOrder.otNumber,
						scheduledDate: format(scheduledDate, "dd-MM-yyyy"),
						nextScheduledDate: format(nextDate, "dd-MM-yyyy"),
					})
					continue
				}

				const latestWorkOrder = task.blockIfPreviousNotCompleted
					? await prisma.workOrder.findFirst({
							where: { maintenancePlanTaskId: task.id, deletedAt: null },
							orderBy: { programDate: "desc" },
							select: {
								id: true,
								otNumber: true,
								status: true,
								programDate: true,
							},
						})
					: null

				if (latestWorkOrder && latestWorkOrder.status !== "COMPLETED") {
					console.log(
						`[CRON BLOCKED] Previous OT ${latestWorkOrder.otNumber} for task "${task.name}" is not completed (status: ${latestWorkOrder.status}). Skipping creation and sending alert.`
					)

					// Create notification for the responsible user
					await prisma.notification.create({
						data: {
							type: "WORK_ORDER",
							title: "OT automática bloqueada",
							targetRole: "USER",
							message: `No se pudo crear la OT automática para "${task.name}" porque la OT anterior (${latestWorkOrder.otNumber}) aún no está completada (estado: ${WorkOrderStatusLabels[latestWorkOrder.status as keyof typeof WorkOrderStatusLabels] ?? latestWorkOrder.status}). Cierre la OT pendiente para que se genere la siguiente.`,
							link: `/admin/dashboard/ordenes-de-trabajo/${latestWorkOrder.id}`,
							userId: responsibleId,
						},
					})

					blockedTasks.push({
						taskName: task.name,
						reason: `Previous OT ${latestWorkOrder.otNumber} not completed (status: ${latestWorkOrder.status})`,
						blockedByOtNumber: latestWorkOrder.otNumber,
						blockedByStatus: latestWorkOrder.status,
						scheduledDate: format(scheduledDate, "dd-MM-yyyy"),
					})
					continue
				}

				const otNumber = await generateOTNumber()

				const estimatedDays = task.automatedEstimatedDaysByMonth
					? getDaysInMonth(scheduledDate)
					: (task.automatedEstimatedDays ?? 1)
				const estimatedHours = task.automatedEstimatedHours ?? 8

				const workOrder = await prisma.workOrder.create({
					data: {
						otNumber,
						type: task.automatedWorkOrderType ?? "PREVENTIVE",
						status: "PLANNED",
						solicitationDate: scheduledDate,
						solicitationTime: "08:00:00",
						programDate: scheduledDate,
						estimatedDays,
						estimatedHours,
						estimatedEndDate: addDays(scheduledDate, estimatedDays),
						priority: task.automatedPriority ?? "MEDIUM",
						capex: task.automatedCapex ?? "CONFIDABILITY",
						workDescription:
							task.automatedWorkDescription ?? `Mantenimiento automático: ${task.name}`,
						workRequest: task.name,
						companyId: task.automatedCompanyId,
						supervisorId: task.automatedSupervisorId!,
						responsibleId,
						maintenancePlanTaskId: task.id,
						equipments: {
							connect: taskEquipments.map((equipment) => ({ id: equipment.id })),
						},
					},
				})

				const nextDate = calculateNextDate(scheduledDate, task.frequency, task.originalDayOfMonth)

				await prisma.maintenancePlanTask.update({
					where: { id: task.id },
					data: { nextDate },
				})

				await logActivity({
					action: ACTIVITY_TYPE.CREATE,
					userId: responsibleId,
					module: MODULES.WORK_ORDERS,
					entityId: workOrder.id,
					entityType: "WORK_ORDER",
					metadata: {
						workOrder,
						task,
					},
				})

				const workOrderWithRelations = await prisma.workOrder.findFirst({
					where: { id: workOrder.id, deletedAt: null },
					include: {
						equipments: { select: { name: true } },
						responsible: { select: { name: true, email: true } },
						supervisor: { select: { name: true, email: true } },
						company: { select: { name: true } },
					},
				})

				if (workOrderWithRelations) {
					try {
						await sendAutomatedWorkOrderEmailsWithFallback({
							workOrder: {
								otNumber: workOrderWithRelations.otNumber,
								type: workOrderWithRelations.type,
								priority: workOrderWithRelations.priority,
								equipments: workOrderWithRelations.equipments,
								programDate: workOrderWithRelations.programDate,
								estimatedDays: workOrderWithRelations.estimatedDays,
								estimatedHours: workOrderWithRelations.estimatedHours,
								responsible: workOrderWithRelations.responsible!,
								workDescription: workOrderWithRelations.workDescription,
								supervisor: workOrderWithRelations.supervisor!,
								company: workOrderWithRelations.company!,
							},
							maintenanceTask: {
								name: task.name,
								frequency: task.frequency,
								emailsForCopy: task.emailsForCopy,
							},
						})
					} catch (emailError) {
						console.error(`Error enviando emails para OT ${workOrder.otNumber}:`, emailError)
					}
				}

				console.log(
					`[CRON SUCCESS] Created work order ${workOrder.otNumber} for task "${task.name}" scheduled on ${format(scheduledDate, "dd-MM-yyyy")}`
				)

				createdWorkOrders.push({
					otNumber: workOrder.otNumber,
					taskName: task.name,
					equipmentName: taskEquipments.map((equipment) => equipment.name).join(", "),
					scheduledDate: format(scheduledDate, "dd-MM-yyyy"),
					nextScheduledDate: format(nextDate, "dd-MM-yyyy"),
				})
			} catch (error) {
				console.error(`[CRON ERROR] Failed to create work order for task "${task.name}":`, error)
				errors.push({
					taskName: task.name,
					error: error instanceof Error ? error.message : "Error desconocido",
				})
			}
		}

		console.log(`[CRON SUMMARY]`, {
			totalEvaluated: allAutomatedTasks.length,
			matchedCriteria: automatedTasks.length,
			created: createdWorkOrders.length,
			skipped: skippedTasks.length,
			blocked: blockedTasks.length,
			errors: errors.length,
		})

		// Send email notification with detailed results
		await resend.emails.send({
			from: "sistema@is360.cl",
			to: "sistema@is360.cl",
			subject: `Proceso de automatización completado - ${createdWorkOrders.length} OT creadas${blockedTasks.length > 0 ? `, ${blockedTasks.length} bloqueadas` : ""}`,
			text: `Proceso de automatización completado. ${createdWorkOrders.length} órdenes de trabajo creadas, ${skippedTasks.length} omitidas, ${blockedTasks.length} bloqueadas, ${errors.length} errores.`,
			html: `
			<h2>Resumen del Proceso de Automatización</h2>
			<p><strong>Tareas Evaluadas:</strong> ${allAutomatedTasks.length}</p>
			<p><strong>Órdenes Creadas:</strong> ${createdWorkOrders.length}</p>
			<p><strong>Tareas Omitidas:</strong> ${skippedTasks.length}</p>
			<p><strong>Tareas Bloqueadas:</strong> ${blockedTasks.length}</p>
			<p><strong>Errores:</strong> ${errors.length}</p>

			${createdWorkOrders.length > 0 ? `<h3>Órdenes Creadas:</h3><ul>${createdWorkOrders.map((wo) => `<li>${wo.otNumber} - ${wo.taskName} (${wo.scheduledDate})</li>`).join("")}</ul>` : ""}
			${blockedTasks.length > 0 ? `<h3>⚠️ Tareas Bloqueadas (OT anterior no cerrada):</h3><ul>${blockedTasks.map((bt) => `<li><strong>${bt.taskName}</strong>: OT ${bt.blockedByOtNumber} en estado ${bt.blockedByStatus} — fecha programada: ${bt.scheduledDate}</li>`).join("")}</ul>` : ""}
			${skippedTasks.length > 0 ? `<h3>Tareas Omitidas:</h3><ul>${skippedTasks.map((st) => `<li>${st.taskName}: ${st.reason} (OT existente: ${st.existingOtNumber})</li>`).join("")}</ul>` : ""}
			${errors.length > 0 ? `<h3>Errores:</h3><ul>${errors.map((e) => `<li>${e.taskName}: ${e.error}</li>`).join("")}</ul>` : ""}
		`,
		})

		return NextResponse.json({
			success: true,
			message: `Proceso de automatización completado. ${createdWorkOrders.length} OTs creadas, ${skippedTasks.length} omitidas, ${blockedTasks.length} bloqueadas.`,
			data: {
				summary: {
					totalEvaluated: allAutomatedTasks.length,
					matchedCriteria: automatedTasks.length,
					created: createdWorkOrders.length,
					skipped: skippedTasks.length,
					blocked: blockedTasks.length,
					errors: errors.length,
				},
				createdWorkOrders,
				skippedTasks,
				blockedTasks,
				errors,
			},
		})
	} catch (error) {
		return NextResponse.json(
			{
				success: false,
				message: "Error en el proceso de automatización",
				error: error instanceof Error ? error.message : "Error desconocido",
			},
			{ status: 500 }
		)
	}
}
