"use server"

import { headers } from "next/headers"

import { sendWorkRequestCommentNotification } from "./send-work-request-comment-notification"
import { ACTIVITY_TYPE, MODULES } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

import { z } from "zod"

const addWorkRequestCommentSchema = z.object({
	workRequestId: z.string(),
	content: z.string().min(1, "El comentario no puede estar vacío"),
})

export async function addWorkRequestComment(
	formData: z.infer<typeof addWorkRequestCommentSchema>
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

	const userId = session.user.id

	try {
		const validatedData = addWorkRequestCommentSchema.parse(formData)

		// Verificar que la solicitud existe
		const workRequest = await prisma.workRequest.findUnique({
			where: {
				id: validatedData.workRequestId,
			},
			include: {
				user: {
					select: {
						id: true,
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

		const comment = await prisma.workRequestComment.create({
			data: {
				content: validatedData.content,
				workRequestId: validatedData.workRequestId,
				userId,
			},
			include: {
				user: {
					select: {
						name: true,
						email: true,
						image: true,
					},
				},
			},
		})

		// Notificar por email al creador, solo si el comentarista no es el mismo creador
		if (
			workRequest.user?.email &&
			workRequest.user.id !== userId
		) {
			await sendWorkRequestCommentNotification({
				userEmail: workRequest.user.email,
				userName: workRequest.user.name || "Usuario",
				commenterName: comment.user.name || "Un usuario",
				requestNumber: workRequest.requestNumber,
				description: workRequest.description,
				commentContent: validatedData.content,
			})
		}

  await logActivity({
			userId: session.user.id,
			module: MODULES.WORK_REQUESTS,
			action: ACTIVITY_TYPE.COMMENT,
			entityId: workRequest.id,
			entityType: "WorkRequestComment",
			metadata: {
				content: validatedData.content,
				workRequestId: validatedData.workRequestId,
				userId,
			},
		})

		return {
			success: "Comentario agregado correctamente",
			comment,
		}
	} catch (error) {
		console.error("Error al agregar el comentario:", error)

		if (error instanceof z.ZodError) {
			return {
				error: error.issues[0]?.message || "Error en los datos proporcionados",
			}
		}

		return {
			error: "Error al agregar el comentario",
		}
	}
}
