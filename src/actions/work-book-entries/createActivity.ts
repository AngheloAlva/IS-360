"use server"

import { UploadResult as UploadFileResult } from "@/lib/upload-files"
import prisma from "@/lib/prisma"

import type { DailyActivitySchema } from "@/lib/form-schemas/work-book/daily-activity.schema"
import type { ENTRY_TYPE } from "@prisma/client"

interface CreateActivityProps {
	userId: string
	entryType: ENTRY_TYPE
	values: DailyActivitySchema
	attachment?: UploadFileResult[]
}

export const createActivity = async ({
	values,
	userId,
	entryType,
	attachment,
}: CreateActivityProps) => {
	try {
		return await prisma.$transaction(async (tx) => {
			const { workOrderId, comments, personnel, ...rest } = values

			const workBookEntryConnectionData: {
				workOrder: { connect: { id: string } }
				assignedUsers: {
					connect: {
						id: string
					}[]
				}
				createdBy: { connect: { id: string } }
				attachments?: { create: { type: string; url: string; name: string }[] }
			} = {
				workOrder: {
					connect: {
						id: workOrderId,
					},
				},
				assignedUsers: {
					connect: personnel.map((personnel) => ({
						id: personnel.userId,
					})),
				},
				createdBy: {
					connect: {
						id: userId,
					},
				},
			}

			if (attachment) {
				workBookEntryConnectionData.attachments = {
					create: attachment.map((attachment) => ({
						type: attachment.type,
						url: attachment.url,
						name: attachment.name,
					})),
				}
			}

			// Nota: Ya no necesitamos calcular las horas trabajadas para el progreso
			// Esta información se usará solo para registro

			// Crear el objeto base de la entrada
			const workEntryData = {
				entryType,
				hasAttachments: !!attachment,
				comments: comments || "",
				...rest,
				...workBookEntryConnectionData,
			}

			// Determinar automáticamente la tarea a la que contribuye esta actividad
			// Con el nuevo modelo, cada actividad representa una tarea completada
			let taskToUpdate = null
			let selectedTaskId = null

			// Buscar la primera tarea incompleta en orden secuencial que coincida con la fecha actual
			const today = new Date()
			today.setHours(0, 0, 0, 0) // Normalizar a inicio del día

			const milestones = await tx.milestone.findMany({
				where: {
					workOrderId,
					isCompleted: false,
				},
				include: {
					tasks: {
						where: {
							isCompleted: false,
							plannedDate: {
								lte: today, // Para incluir tareas planificadas para hoy o antes
							},
						},
						orderBy: { order: "asc" },
					},
				},
				orderBy: { order: "asc" },
			})

			// Buscar la primera tarea pendiente que coincida con los criterios
			for (const milestone of milestones) {
				if (milestone.tasks.length > 0) {
					taskToUpdate = milestone.tasks[0]
					selectedTaskId = taskToUpdate.id
					break
				}
			}

			// Crear la entrada sin la asociación a la tarea para evitar errores de tipos
			const newWorkEntry = await tx.workEntry.create({
				data: workEntryData,
			})

			// Si encontramos una tarea para actualizar, asociarla a la entrada creada y marcarla como completada
			if (selectedTaskId) {
				await tx.workEntry.update({
					where: { id: newWorkEntry.id },
					data: {
						milestoneTask: { connect: { id: selectedTaskId } },
					},
				})

				// Marcar la tarea como completada
				await tx.milestoneTask.update({
					where: { id: selectedTaskId },
					data: {
						isCompleted: true,
						completedAt: new Date(),
						activityStartTime: rest.activityStartTime,
						activityEndTime: rest.activityEndTime,
						comments: comments || "",
					},
				})
			}

			const workOrder = await tx.workOrder.findUnique({
				where: { id: workOrderId },
				include: {
					equipment: {
						select: {
							id: true,
						},
					},
				},
			})

			// No actualizar el progreso aquí ya que será recalculado en base a los hitos
			await tx.workOrder.update({
				where: {
					id: workOrderId,
				},
				data: {
					status: "IN_PROGRESS",
				},
			})

			// Si se identificó una tarea para actualizar, recalcular el progreso del hito y del trabajo
			if (selectedTaskId) {
				// Obtener la tarea con su hito para actualizar su progreso
				const currentTask = await tx.milestoneTask.findUnique({
					where: { id: selectedTaskId },
					include: { milestone: true },
				})

				if (currentTask?.milestone) {
					// Recalcular el progreso del hito
					// Obtener todas las tareas del hito
					const milestoneTasks = await tx.milestoneTask.findMany({
						where: { milestoneId: currentTask.milestoneId },
					})

					// Calcular el progreso del hito basado en el número de tareas completadas
					const totalTasks = milestoneTasks.length
					const completedTasks = milestoneTasks.filter((t) => t.isCompleted).length
					const milestoneProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

					// Verificar si todas las tareas están completadas
					const allTasksCompleted = milestoneTasks.every((task) => task.isCompleted)

					// Actualizar el hito
					await tx.milestone.update({
						where: { id: currentTask.milestoneId },
						data: {
							progress: milestoneProgress,
							isCompleted: allTasksCompleted,
						},
					})

					// Recalcular el progreso del trabajo
					// Obtener todos los hitos del trabajo
					const milestones = await tx.milestone.findMany({
						where: { workOrderId },
					})

					// Calcular el progreso del trabajo basado en los pesos de los hitos
					const totalWeight = milestones.reduce((sum, m) => sum + Number(m.weight || 1), 0)
					const weightedProgress = milestones.reduce((sum, m) => {
						return sum + Number(m.progress) * Number(m.weight || 1)
					}, 0)

					// Calcular el porcentaje de progreso general ponderado
					const workProgressStatus = totalWeight > 0 ? weightedProgress / totalWeight : 0

					// Actualizar el estado de progreso del trabajo
					await tx.workOrder.update({
						where: { id: workOrderId },
						data: { workProgressStatus },
					})
				}
			}

			workOrder?.equipment.forEach(async (equipment) => {
				await tx.equipmentHistory.create({
					data: {
						equipment: {
							connect: {
								id: equipment.id,
							},
						},
						workEntry: {
							connect: {
								id: newWorkEntry.id,
							},
						},
						changeType: workOrder?.type || "",
						description: rest.activityName,
						status: "",
						modifiedBy: {
							connect: {
								id: userId,
							},
						},
					},
				})
			})

			return {
				ok: true,
				data: newWorkEntry,
				message: "Actividad creada exitosamente",
			}
		})
	} catch (error) {
		console.error(error)

		return {
			ok: false,
			message: "Error al crear la actividad" + error,
		}
	}
}
