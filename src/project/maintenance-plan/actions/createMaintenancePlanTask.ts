"use server"

import { headers } from "next/headers"

import { ACTIVITY_TYPE, MODULES } from "@prisma/client"
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
				...(values.equipmentId
					? {
							equipment: {
								connect: {
									id: values.equipmentId,
								},
							},
						}
					: {
							equipment: {
								connect: {
									id: maintenancePlan.equipment.id,
								},
							},
						}),
				createdBy: {
					connect: {
						id: values.createdById,
					},
				},
				attachments: {
					create: attachments.map((attachment) => ({
						name: values.name,
						url: attachment.url,
						type: attachment.type,
					})),
				},
			},
		})

		logActivity({
			userId: values.createdById,
			module: MODULES.MAINTENANCE_PLANS,
			action: ACTIVITY_TYPE.CREATE,
			entityId: task.id,
			entityType: "MaintenancePlanTask",
			metadata: {
				name: values.name,
				frequency: values.frequency,
				maintenancePlanId: maintenancePlan.id,
				equipmentId: values.equipmentId || maintenancePlan.equipment.id,
				nextDate: values.nextDate.toISOString(),
				hasAttachments: attachments.length > 0,
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
