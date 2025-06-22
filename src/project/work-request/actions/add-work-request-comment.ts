"use server"

import { headers } from "next/headers"

import { ACTIVITY_TYPE, MODULES } from "@prisma/client"
import { logActivity } from "@/lib/activity/log"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

import { z } from "zod"

const addWorkRequestCommentSchema = z.object({
	workRequestId: z.string(),
	content: z.string().min(1, "El comentario no puede estar vacío"),
})

export async function addWorkRequestComment(
	formData: z.infer<typeof addWorkRequestCommentSchema>,
	userId: string
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
		const validatedData = addWorkRequestCommentSchema.parse(formData)

		// Verificar que la solicitud existe
		const workRequest = await prisma.workRequest.findUnique({
			where: {
				id: validatedData.workRequestId,
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

		logActivity({
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
				error: error.errors[0]?.message || "Error en los datos proporcionados",
			}
		}

		return {
			error: "Error al agregar el comentario",
		}
	}
}
