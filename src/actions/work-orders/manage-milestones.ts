"use server"

import { revalidatePath } from "next/cache"

import prisma from "@/lib/prisma"

import type { ConfirmActivitySchema } from "@/lib/form-schemas/work-book/confirm-activity.schema"
import type { WorkBookMilestonesSchema } from "@/lib/form-schemas/work-book/milestones.schema"
import type { UploadResult as UploadFileResult } from "@/lib/upload-files"

interface SaveMilestonesResponse {
	ok: boolean
	message: string
}

export async function createMilestones(
	values: WorkBookMilestonesSchema
): Promise<SaveMilestonesResponse> {
	try {
		const workOrder = await prisma.workOrder.findUnique({
			where: { id: values.workOrderId },
			include: { milestones: true },
		})

		if (!workOrder) {
			return {
				ok: false,
				message: "El libro de obras no existe",
			}
		}

		await prisma.$transaction(async (tx) => {
			for (const [index, milestone] of values.milestones.entries()) {
				const createdMilestone = await tx.milestone.create({
					data: {
						name: milestone.name,
						description: milestone.description || "",
						order: index,
						isCompleted: false,
						progress: 0,
						weight: Number(milestone.weight),
						startDate: milestone.startDate,
						endDate: milestone.endDate,
						workOrder: {
							connect: { id: values.workOrderId },
						},
					},
				})

				for (const [taskIndex, task] of milestone.tasks.entries()) {
					await tx.milestoneTask.create({
						data: {
							name: task.name,
							order: taskIndex,
							description: task.description || "",
							isCompleted: false,
							plannedDate: task.plannedDate,
							activityStartTime: task.activityStartTime,
							activityEndTime: task.activityEndTime,
							estimatedHours: Number(task.estimatedHours),
							estimatedPeople: Number(task.estimatedPeople),
							milestone: {
								connect: { id: createdMilestone.id },
							},
						},
					})
				}
			}
		})

		revalidatePath(`/dashboard/libro-de-obras/${values.workOrderId}`)

		return {
			ok: true,
			message: "Hitos guardados correctamente",
		}
	} catch (error) {
		console.error("Error al guardar los hitos:", error)
		return {
			ok: false,
			message: error instanceof Error ? error.message : "Error al guardar los hitos",
		}
	}
}

export async function completeMilestoneTask(
	taskId: string,
	data: ConfirmActivitySchema,
	files?: UploadFileResult[]
) {
	try {
		// Nota: La autenticación debe ser manejada desde el componente cliente
		// Aquí asumimos que si se llama a esta función, la autenticación ya fue validada

		// 1. Actualizar la tarea como completada
		const task = await prisma.milestoneTask.update({
			where: { id: taskId },
			data: {
				isCompleted: true,
				completedAt: new Date(),
				activityStartTime: data.activityStartTime,
				activityEndTime: data.activityEndTime,
				comments: data.comments,
			},
			include: {
				milestone: {
					include: {
						tasks: true,
						workOrder: true,
					},
				},
			},
		})

		// Calcular progreso del hito
		const totalTasks = task.milestone.tasks.length
		const completedTasks = task.milestone.tasks.filter((t) => t.isCompleted).length

		// Calcular progreso basado en el número de tareas completadas
		const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

		await prisma.milestone.update({
			where: { id: task.milestone.id },
			data: {
				progress,
				isCompleted: completedTasks === totalTasks,
			},
		})

		// 2. Crear una entrada en WorkEntry para registrar esta tarea como actividad diaria
		// Obtenemos el userId del primer usuario administrador
		const admin = await prisma.user.findFirst({
			where: { role: "ADMIN" },
		})

		if (!admin) {
			return {
				ok: false,
				message: "No se encontró un usuario administrador para registrar la actividad",
			}
		}

		await prisma.workEntry.create({
			data: {
				entryType: "DAILY_ACTIVITY",
				activityName: task.name,
				activityStartTime: data.activityStartTime,
				activityEndTime: data.activityEndTime,
				comments: data.comments || `Actividad "${task.name}" del hito "${task.milestone.name}"`,
				executionDate: new Date(),
				isFavorite: false,
				hasAttachments: false,
				approvalStatus: "APPROVED",
				workOrder: { connect: { id: task.milestone.workOrder.id } },
				milestoneTask: { connect: { id: task.id } },
				createdBy: { connect: { id: admin.id } },
				signedBy: { connect: { id: admin.id } },
				signedAt: new Date(),
				...(files && {
					attachments: {
						create: files?.map((file) => ({
							url: file.url,
							type: file.type,
							name: file.name,
						})),
					},
				}),
			},
		})

		// Actualizar el progreso general del libro de obras basado en el progreso ponderado de los hitos
		const milestones = await prisma.milestone.findMany({
			where: { workOrderId: task.milestone.workOrder.id },
		})

		// Calcular el progreso del trabajo basado en los pesos de los hitos
		const totalWeight = milestones.reduce((sum: number, m) => sum + Number(m.weight || 1), 0)
		const weightedProgress = milestones.reduce((sum: number, m) => {
			return sum + Number(m.progress) * Number(m.weight || 1)
		}, 0)

		// Calcular el porcentaje de progreso general ponderado
		const workProgressStatus = totalWeight > 0 ? weightedProgress / totalWeight : 0

		// Actualizar el estado de progreso del trabajo
		await prisma.workOrder.update({
			where: { id: task.milestone.workOrder.id },
			data: { workProgressStatus, status: "IN_PROGRESS" },
		})

		revalidatePath(`/dashboard/libro-de-obras/${task.milestone.workOrder.id}`)

		return {
			ok: true,
			message: "Actividad completada correctamente y registrada en el libro de obras",
		}
	} catch (error) {
		console.error("Error al completar la actividad:", error)
		return {
			ok: false,
			message: error instanceof Error ? error.message : "Error al completar la actividad",
		}
	}
}
