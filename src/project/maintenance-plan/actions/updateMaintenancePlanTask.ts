"use server"

import { headers } from "next/headers"
import { revalidatePath } from "next/cache"

import { type MaintenancePlanTaskSchema } from "../schemas/maintenance-plan-task.schema"
import { type UploadResult } from "@/lib/upload-files"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

interface UpdateMaintenancePlanTaskProps {
	values: MaintenancePlanTaskSchema
	attachments?: UploadResult[]
	taskId: string
}

const getNormalizedEquipmentIds = (
	values: MaintenancePlanTaskSchema,
	currentEquipmentId: string | null
): string[] => {
	const ids = values.equipmentIds?.length
		? values.equipmentIds
		: values.equipmentId
			? [values.equipmentId]
			: currentEquipmentId
				? [currentEquipmentId]
				: []

	return [...new Set(ids)].filter(Boolean)
}

export async function updateMaintenancePlanTask({
	values,
	attachments = [],
	taskId,
}: UpdateMaintenancePlanTaskProps) {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return {
			ok: false,
			message: "No autorizado",
		}
	}

	const hasPermission = await auth.api.userHasPermission({
		body: {
			userId: session.user.id,
			permission: {
				maintenancePlan: ["update"],
			},
		},
	})

	if (!hasPermission) {
		return {
			ok: false,
			message: "No autorizado",
		}
	}

	try {
		const existingTask = await prisma.maintenancePlanTask.findUnique({
			where: { id: taskId },
		})

		if (!existingTask) {
			return {
				ok: false,
				message: "Tarea no encontrada",
			}
		}

		const equipmentIds = getNormalizedEquipmentIds(values, existingTask.equipmentId)

		await prisma.maintenancePlanTask.update({
			where: { id: taskId },
			data: {
				name: values.name,
				description: values.description,
				frequency: values.frequency,
				nextDate: values.nextDate,
				originalDayOfMonth: values.nextDate.getDate(),
				specialty: values.specialty ?? null,
				taskType: values.taskType ?? null,
				...(equipmentIds.length > 0
					? {
							equipment: {
								connect: { id: equipmentIds[0] },
							},
							equipments: {
								set: equipmentIds.map((id) => ({ id })),
							},
						}
					: {}),
				// Campos de automatización
				isAutomated: values.isAutomated || false,
				emailsForCopy: values.emailsForCopy,
				automatedCompanyId: values.automatedCompanyId || null,
				automatedResponsible: {
					connect: { id: values.automatedResponsibleId },
				},
				automatedSupervisorId: values.automatedSupervisorId || null,
				automatedWorkOrderType: values.automatedWorkOrderType || null,
				automatedPriority: values.automatedPriority || null,
				automatedCapex: values.automatedCapex || null,
				automatedEstimatedDays: values.automatedEstimatedDays
					? +values.automatedEstimatedDays
					: null,
				automatedEstimatedDaysByMonth: values.automatedEstimatedDaysByMonth || false,
				automatedEstimatedHours: values.automatedEstimatedHours
					? +values.automatedEstimatedHours
					: null,
				automatedDaysInAdvance: values.automatedDaysInAdvance
					? +values.automatedDaysInAdvance
					: null,
				automatedWorkDescription: values.automatedWorkDescription || null,
				blockIfPreviousNotCompleted: values.blockIfPreviousNotCompleted ?? true,
				attachments: {
					createMany: {
						data: attachments.map((attachment) => ({
							name: values.name,
							url: attachment.url,
							type: attachment.type,
							createdById: session.user.id,
						})),
					},
				},
			},
		})

		revalidatePath("/maintenance-plans")

		return {
			ok: true,
			message: "Tarea actualizada exitosamente",
		}
	} catch (error) {
		console.error(error)
		return {
			ok: false,
			message: "Error al actualizar la tarea",
		}
	}
}
