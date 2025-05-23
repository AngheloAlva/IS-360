"use server"

import { generateSlug } from "@/lib/generateSlug"
import prisma from "@/lib/prisma"

import type { MaintenancePlanTaskSchema } from "@/lib/form-schemas/maintenance-plan/maintenance-plan-task.schema"
import type { UploadResult } from "@/lib/upload-files"

interface CreateMaintenancePlanTaskValues {
	values: MaintenancePlanTaskSchema
	attachments: UploadResult[]
}

export const createMaintenancePlanTask = async ({
	values,
	attachments,
}: CreateMaintenancePlanTaskValues) => {
	try {
		const maintenancePlan = await prisma.maintenancePlan.findUnique({
			where: {
				slug: values.maintenancePlanSlug,
			},
			select: {
				id: true,
			},
		})

		if (!maintenancePlan) {
			return {
				ok: false,
				message: "Plan de mantenimiento no encontrado",
			}
		}

		const taskSlug = generateSlug(values.name)

		await prisma.maintenancePlanTask.create({
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
				equipment: {
					connect: {
						id: values.equipmentId,
					},
				},
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
