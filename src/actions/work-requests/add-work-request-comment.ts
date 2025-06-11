"use server"

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
