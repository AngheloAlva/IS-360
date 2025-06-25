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
				attachments: {
					createMany: {
						data: attachments.map((attachment) => ({
							name: attachment.name,
							url: attachment.url,
							size: attachment.size,
							type: attachment.type,
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
