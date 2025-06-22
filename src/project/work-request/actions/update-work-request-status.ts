"use server"

import { headers } from "next/headers"
import { z } from "zod"

import { sendWorkRequestStatusUpdateEmail } from "./send-work-request-status-update"
import { ACTIVITY_TYPE, MODULES } from "@prisma/client"
import { WORK_REQUEST_STATUS } from "@prisma/client"
import { logActivity } from "@/lib/activity/log"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

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
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user) {
		return {
			ok: false,
			message: "No se pudo obtener la sesión del usuario",
		}
	}

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

		logActivity({
			userId: session.user.id,
			module: MODULES.WORK_REQUESTS,
			action: ACTIVITY_TYPE.UPDATE,
			entityId: updatedWorkRequest.id,
			entityType: "WorkRequest",
			metadata: {
				requestNumber: updatedWorkRequest.requestNumber,
				description: updatedWorkRequest.description,
				isUrgent: updatedWorkRequest.isUrgent,
				requestDate: updatedWorkRequest.requestDate,
				observations: updatedWorkRequest.observations,
				location: updatedWorkRequest.location,
				customLocation: updatedWorkRequest.customLocation,
			},
		})

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
