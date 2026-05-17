import { ACTIVITY_TYPE, MODULES } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { getDemoUser } from "@/lib/demo-auth"
import { getDemoDb } from "@/lib/demo-db/client"

import type { CommentSchema } from "@/project/document/schemas/comment.schema"

interface NewCommentProps {
	values: CommentSchema
}

export const newComment = async ({
	values,
}: NewCommentProps): Promise<{ ok: boolean; message: string }> => {
	const user = getDemoUser()
	if (!user) {
		return { ok: false, message: "No autorizado" }
	}

	try {
		const db = await getDemoDb()
		const id = crypto.randomUUID()
		const now = new Date().toISOString()

		await db.query(
			`INSERT INTO "file_comment" (
				"id", "content", "fileId", "userId", "createdAt", "updatedAt"
			) VALUES ($1, $2, $3, $4, $5, $5)`,
			[id, values.content, values.fileId, user.id, now],
		)

		await logActivity({
			userId: user.id,
			module: MODULES.DOCUMENTATION,
			action: ACTIVITY_TYPE.CREATE,
			entityId: id,
			entityType: "FileComment",
			metadata: { content: values.content, fileId: values.fileId },
		})

		return { ok: true, message: "Comentario creado exitosamente" }
	} catch (error) {
		console.error("[NEW_COMMENT]", error)
		return { ok: false, message: "Error al crear el comentario" }
	}
}
