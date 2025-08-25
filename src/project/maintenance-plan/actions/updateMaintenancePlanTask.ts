"use server"

import { revalidatePath } from "next/cache"

import { type MaintenancePlanTaskSchema } from "../schemas/maintenance-plan-task.schema"
import { type UploadResult } from "@/lib/upload-files"
import prisma from "@/lib/prisma"

interface UpdateMaintenancePlanTaskProps {
	values: MaintenancePlanTaskSchema
	attachments?: UploadResult[]
	taskId: string
}

export async function updateMaintenancePlanTask({
	values,
	attachments = [],
	taskId,
}: UpdateMaintenancePlanTaskProps) {
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

		await prisma.maintenancePlanTask.update({
			where: { id: taskId },
			data: {
				name: values.name,
				description: values.description,
				frequency: values.frequency,
				nextDate: values.nextDate,
				equipmentId: values.equipmentId,
				// Campos de automatización
				isAutomated: values.isAutomated || false,
				emailsForCopy: values.emailsForCopy,
				automatedCompanyId: values.isAutomated ? process.env.NEXT_PUBLIC_OTC_COMPANY_ID : null,
				automatedSupervisorId: values.automatedSupervisorId || null,
				automatedWorkOrderType: values.automatedWorkOrderType || null,
				automatedPriority: values.automatedPriority || null,
				automatedCapex: values.automatedCapex || null,
				automatedEstimatedDays: values.automatedEstimatedDays
					? +values.automatedEstimatedDays
					: null,
				automatedEstimatedHours: values.automatedEstimatedHours
					? +values.automatedEstimatedHours
					: null,
				automatedWorkDescription: values.automatedWorkDescription || null,
				attachments: {
					createMany: {
						data: attachments.map((attachment) => ({
							name: values.name,
							url: attachment.url,
							type: attachment.type,
							createdById: values.createdById,
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
