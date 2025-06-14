"use server"

import prisma from "@/lib/prisma"

import type { CommentSchema } from "@/features/document/schemas/comment.schema"

interface NewCommentProps {
	values: CommentSchema
}

export const newComment = async ({
	values,
}: NewCommentProps): Promise<{ ok: boolean; message: string }> => {
	try {
		await prisma.fileComment.create({
			data: {
				content: values.content,
				file: {
					connect: {
						id: values.fileId,
					},
				},
				user: {
					connect: {
						id: values.userId,
					},
				},
			},
		})

		return { ok: true, message: "Comentario creado exitosamente" }
	} catch (error) {
		console.error("Error creating comment:", error)
		return { ok: false, message: "Error al crear el comentario" }
	}
}
