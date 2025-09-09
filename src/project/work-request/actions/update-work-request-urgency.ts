"use server"

import { headers } from "next/headers"
import { z } from "zod"

import { ACCESS_ROLE, ACTIVITY_TYPE, MODULES } from "@prisma/client"
import { logActivity } from "@/lib/activity/log"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

const updateWorkRequestUrgencySchema = z.object({
	id: z.string(),
	isUrgent: z.boolean(),
})

export async function updateWorkRequestUrgency(
	formData: z.infer<typeof updateWorkRequestUrgencySchema>
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

	// Validar que el usuario tenga permisos de ADMIN
	if (session.user.accessRole !== ACCESS_ROLE.ADMIN) {
		return {
			error: "No tienes permisos para realizar esta acción",
		}
	}

	try {
		const validatedData = updateWorkRequestUrgencySchema.parse(formData)

		const workRequest = await prisma.workRequest.findUnique({
			where: {
				id: validatedData.id,
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
				isUrgent: validatedData.isUrgent,
			},
		})

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
				urgencyChanged: true,
			},
		})

		return {
			success: `Solicitud ${validatedData.isUrgent ? "marcada como urgente" : "desmarcada como urgente"} correctamente`,
			workRequest: updatedWorkRequest,
		}
	} catch (error) {
		console.error("Error al actualizar la urgencia de la solicitud:", error)

		return {
			error: "Error al actualizar la urgencia de la solicitud",
		}
	}
}
