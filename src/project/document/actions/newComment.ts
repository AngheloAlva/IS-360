"use server"

import { headers } from "next/headers"

import { ACTIVITY_TYPE, MODULES } from "@prisma/client"
import { logActivity } from "@/lib/activity/log"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

import type { CommentSchema } from "@/project/document/schemas/comment.schema"

interface NewCommentProps {
	values: CommentSchema
}

export const newComment = async ({
	values,
}: NewCommentProps): Promise<{ ok: boolean; message: string }> => {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return {
			ok: false,
			message: "No autorizado",
		}
	}

	try {
		const comment = await prisma.fileComment.create({
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

		logActivity({
			userId: session.user.id,
			module: MODULES.DOCUMENTATION,
			action: ACTIVITY_TYPE.CREATE,
			entityId: comment.id,
			entityType: "FileComment",
			metadata: {
				content: values.content,
				fileId: values.fileId,
			},
		})

		return { ok: true, message: "Comentario creado exitosamente" }
	} catch (error) {
		console.error("Error creating comment:", error)
		return { ok: false, message: "Error al crear el comentario" }
	}
}
