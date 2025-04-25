"use server"

import prisma from "@/lib/prisma"

import type { MaintenancePlanTaskSchema } from "@/lib/form-schemas/maintenance-plan/maintenance-plan-task.schema"
import { generateSlug } from "@/lib/generateSlug"

interface CreateMaintenancePlanTaskValues {
	values: MaintenancePlanTaskSchema
}

export const createMaintenancePlanTask = async ({ values }: CreateMaintenancePlanTaskValues) => {
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
				workOrderType: values.workOrderType,
				estimatedDays: +values.estimatedDays,
				workOrderCapex: values.workOrderCapex,
				estimatedHours: +values.estimatedHours,
				workOrderPriority: values.workOrderPriority,
				isInternalResponsible: values.isInternalResponsible,
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
				company: {
					connect: {
						id: values.companyId,
					},
				},
				responsible: {
					connect: {
						id: values.responsibleId,
					},
				},
				createdBy: {
					connect: {
						id: values.createdById,
					},
				},
				attachments: {
					create: values.attachments.map((attachment) => ({
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
