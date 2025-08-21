import { addDays, addMonths, addWeeks, addYears, format, startOfDay } from "date-fns"
import { NextResponse, NextRequest } from "next/server"

import { ACTIVITY_TYPE, MODULES, PLAN_FREQUENCY } from "@prisma/client"
import { logActivity } from "@/lib/activity/log"
import { resend } from "@/lib/resend"
import db from "@/lib/prisma"

import { sendAutomatedWorkOrderEmailsWithFallback } from "@/project/work-order/actions/sendAutomatedWorkOrderEmails"
import { generateOTNumber } from "@/project/work-order/actions/generateOTNumber"

const OTC_COMPANY_ID = process.env.NEXT_PUBLIC_OTC_COMPANY_ID

function calculateNextDate(currentDate: Date, frequency: PLAN_FREQUENCY): Date {
	switch (frequency) {
		case PLAN_FREQUENCY.DAILY:
			return addDays(currentDate, 1)
		case PLAN_FREQUENCY.WEEKLY:
			return addWeeks(currentDate, 1)
		case PLAN_FREQUENCY.MONTHLY:
			return addMonths(currentDate, 1)
		case PLAN_FREQUENCY.BIMONTHLY:
			return addMonths(currentDate, 2)
		case PLAN_FREQUENCY.QUARTERLY:
			return addMonths(currentDate, 3)
		case PLAN_FREQUENCY.FOURMONTHLY:
			return addMonths(currentDate, 4)
		case PLAN_FREQUENCY.BIANNUAL:
			return addMonths(currentDate, 6)
		case PLAN_FREQUENCY.YEARLY:
			return addYears(currentDate, 1)
		default:
			return addMonths(currentDate, 1)
	}
}

export async function GET(request: NextRequest) {
	try {
		const authHeader = request.headers.get("authorization")
		if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
			return new Response("Unauthorized", {
				status: 401,
			})
		}

		const today = startOfDay(new Date())

		const automatedTasks = await db.maintenancePlanTask.findMany({
			where: {
				isAutomated: true,
				automatedCompanyId: OTC_COMPANY_ID,
				automatedSupervisorId: {
					not: null,
				},
				nextDate: {
					lte: today,
				},
			},
			include: {
				equipment: true,
				createdBy: true,
			},
		})

		const createdWorkOrders = []
		const errors = []

		for (const task of automatedTasks) {
			try {
				const existingOT = await db.workOrder.findFirst({
					where: {
						maintenancePlanTaskId: task.id,
						solicitationDate: {
							gte: today,
							lt: addDays(today, 1),
						},
					},
				})

				if (existingOT) {
					continue
				}

				const otNumber = await generateOTNumber()

				const estimatedDays = task.automatedEstimatedDays || 1
				const estimatedHours = task.automatedEstimatedHours || 8

				const workOrder = await db.workOrder.create({
					data: {
						otNumber,
						type: task.automatedWorkOrderType || "PREVENTIVE",
						status: "PLANNED",
						solicitationDate: today,
						solicitationTime: "08:00:00",
						programDate: today,
						estimatedDays,
						estimatedHours,
						estimatedEndDate: addDays(today, estimatedDays),
						priority: task.automatedPriority || "MEDIUM",
						capex: task.automatedCapex || "CONFIDABILITY",
						workDescription:
							task.automatedWorkDescription || `Mantenimiento automático: ${task.name}`,
						workRequest: task.name,
						companyId: task.automatedCompanyId,
						supervisorId: task.automatedSupervisorId!,
						responsibleId: task.createdBy.id,
						maintenancePlanTaskId: task.id,
						equipments: {
							connect: { id: task.equipment.id },
						},
					},
				})

				const nextDate = calculateNextDate(task.nextDate, task.frequency)

				await db.maintenancePlanTask.update({
					where: { id: task.id },
					data: { nextDate },
				})

				await logActivity({
					action: ACTIVITY_TYPE.CREATE,
					userId: task.createdBy.id,
					module: MODULES.WORK_ORDERS,
					entityId: workOrder.id,
					entityType: "WORK_ORDER",
					metadata: {
						workOrder,
						task,
					},
				})

				const workOrderWithRelations = await db.workOrder.findUnique({
					where: { id: workOrder.id },
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
							},
						})
					} catch (emailError) {
						console.error(`Error enviando emails para OT ${workOrder.otNumber}:`, emailError)
					}
				}

				createdWorkOrders.push({
					otNumber: workOrder.otNumber,
					taskName: task.name,
					equipmentName: task.equipment.name,
					nextScheduledDate: format(nextDate, "dd-MM-yyyy"),
				})
			} catch (error) {
				errors.push({
					taskName: task.name,
					error: error instanceof Error ? error.message : "Error desconocido",
				})
			}
		}

		await resend.emails.send({
			from: "anghelo.alva@ingenieriasimple.cl",
			to: "anghelo.alva@ingenieriasimple.cl",
			subject: `Proceso de automatización completado`,
			text: `Proceso de automatización completado. ${createdWorkOrders.length} órdenes de trabajo creadas.`,
			html: `<ul>${createdWorkOrders.map((workOrder) => `<li>${workOrder.otNumber}</li>`).join("")}</ul>`,
		})

		return NextResponse.json({
			success: true,
			message: `Proceso de automatización completado. ${createdWorkOrders.length} órdenes de trabajo creadas.`,
			data: {
				createdWorkOrders,
				errors,
				totalProcessed: automatedTasks.length,
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
