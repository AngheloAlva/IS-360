"use server"

import prisma from "@/lib/prisma"
import { WORK_REQUEST_STATUS } from "@prisma/client"
import { z } from "zod"
import { sendWorkRequestStatusUpdateEmail } from "../emails/send-work-request-status-update"

const updateWorkRequestStatusSchema = z.object({
	id: z.string(),
	status: z.enum([
		WORK_REQUEST_STATUS.REPORTED,
		WORK_REQUEST_STATUS.ATTENDED,
		WORK_REQUEST_STATUS.CANCELLED,
	]),
})

export async function updateWorkRequestStatus(
	formData: z.infer<typeof updateWorkRequestStatusSchema>
) {
	try {
		const validatedData = updateWorkRequestStatusSchema.parse(formData)

		const workRequest = await prisma.workRequest.findUnique({
			where: {
				id: validatedData.id,
			},
			include: {
				user: {
					select: {
						name: true,
						email: true,
					},
				},
			},
		})

		if (!workRequest) {
			return {
				error: "Solicitud no encontrada",
			}
		}

		const updatedWorkRequest = await prisma.workRequest.update({
			where: {
				id: validatedData.id,
			},
			data: {
				status: validatedData.status,
			},
		})

		// Enviar correo de notificación al usuario que creó la solicitud
		if (workRequest.user.email) {
			await sendWorkRequestStatusUpdateEmail({
				userEmail: workRequest.user.email,
				userName: workRequest.user.name || "Usuario",
				requestNumber: workRequest.requestNumber,
				status: validatedData.status,
				description: workRequest.description,
			})
		}

		return {
			success: "Estado actualizado correctamente",
			workRequest: updatedWorkRequest,
		}
	} catch (error) {
		console.error("Error al actualizar el estado de la solicitud:", error)

		return {
			error: "Error al actualizar el estado de la solicitud",
		}
	}
}
