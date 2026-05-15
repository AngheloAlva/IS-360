"use server"

import { headers } from "next/headers"

import { ACTIVITY_TYPE, MODULES } from "@/generated/prisma/enums"
import { generateSlug } from "@/lib/generateSlug"
import { logActivity } from "@/lib/activity/log"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

import type { MaintenancePlanTaskSchema } from "@/project/maintenance-plan/schemas/maintenance-plan-task.schema"
import type { UploadResult } from "@/lib/upload-files"

interface CreateMaintenancePlanTaskValues {
	values: MaintenancePlanTaskSchema
	attachments: UploadResult[]
}

const getNormalizedEquipmentIds = (
	values: MaintenancePlanTaskSchema,
	fallbackId: string
): string[] => {
	const ids = values.equipmentIds?.length
		? values.equipmentIds
		: values.equipmentId
			? [values.equipmentId]
			: [fallbackId]

	return [...new Set(ids)].filter(Boolean)
}

export const createMaintenancePlanTask = async ({
	values,
	attachments,
}: CreateMaintenancePlanTaskValues) => {
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
				maintenancePlan: ["create"],
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
		const maintenancePlan = await prisma.maintenancePlan.findUnique({
			where: {
				slug: values.maintenancePlanSlug,
			},
			select: {
				id: true,
				equipment: {
					select: {
						id: true,
					},
				},
			},
		})

		if (!maintenancePlan) {
			return {
				ok: false,
				message: "Plan de mantenimiento no encontrado",
			}
		}

		const taskSlug = generateSlug(values.name)
		const equipmentIds = getNormalizedEquipmentIds(values, maintenancePlan.equipment.id)

		const task = await prisma.maintenancePlanTask.create({
			data: {
				slug: taskSlug,
				name: values.name,
				frequency: values.frequency,
				description: values.description,
				maintenancePlan: {
					connect: {
						id: maintenancePlan.id,
					},
				},
				nextDate: values.nextDate,
				originalDayOfMonth: values.nextDate.getDate(),
				specialty: values.specialty ?? null,
				taskType: values.taskType ?? null,
				// Campos de automatización
				emailsForCopy: values.emailsForCopy,
				isAutomated: values.isAutomated || false,
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
				equipment: {
					connect: {
						id: equipmentIds[0],
					},
				},
				equipments: {
					connect: equipmentIds.map((id) => ({ id })),
				},
				createdBy: {
					connect: {
						id: values.createdById,
					},
				},
				attachments: {
					create: attachments.map((attachment) => ({
						...attachment,
						createdBy: {
							connect: {
								id: values.createdById,
							},
						},
					})),
				},
			},
		})

		await logActivity({
			userId: values.createdById,
			module: MODULES.MAINTENANCE_PLANS,
			action: ACTIVITY_TYPE.CREATE,
			entityId: task.id,
			entityType: "MaintenancePlanTask",
			metadata: {
				name: values.name,
				frequency: values.frequency,
				maintenancePlanId: maintenancePlan.id,
				equipmentId: equipmentIds[0],
				equipmentIds,
				nextDate: values.nextDate.toISOString(),
				slug: taskSlug,
			},
		})

		return {
			ok: true,
			message: "Tarea de mantenimiento creada exitosamente",
		}
	} catch (error) {
		console.log(error)
		return {
			ok: false,
			message: error instanceof Error ? error.message : "Error al crear la tarea de mantenimiento",
		}
	}
}
