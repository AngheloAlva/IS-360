import { z } from "zod"

import { sendWorkRequestCommentNotification } from "./send-work-request-comment-notification"
import { ACTIVITY_TYPE, MODULES } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { getDemoUser } from "@/lib/demo-auth"
import { getDemoDb } from "@/lib/demo-db/client"

const addWorkRequestCommentSchema = z.object({
	workRequestId: z.string(),
	content: z.string().min(1, "El comentario no puede estar vacío"),
})

export async function addWorkRequestComment(
	formData: z.infer<typeof addWorkRequestCommentSchema>,
) {
	const user = getDemoUser()
	if (!user) {
		return { ok: false, message: "No se pudo obtener la sesión del usuario" }
	}

	try {
		const validatedData = addWorkRequestCommentSchema.parse(formData)
		const db = await getDemoDb()

		const workRequestResult = await db.query<{
			id: string
			requestNumber: string
			description: string
			userId: string
		}>(
			`SELECT id, "requestNumber", description, "userId"
			 FROM "work_request"
			 WHERE id = $1`,
			[validatedData.workRequestId],
		)
		const workRequest = workRequestResult.rows[0]
		if (!workRequest) {
			return { error: "Solicitud no encontrada" }
		}

		const requestUserResult = await db.query<{
			id: string
			name: string
			email: string
		}>(`SELECT id, name, email FROM "user" WHERE id = $1`, [workRequest.userId])
		const requestUser = requestUserResult.rows[0]

		const commentId = crypto.randomUUID()
		const now = new Date().toISOString()

		await db.query(
			`INSERT INTO "work_request_comment" (id, content, "userId", "workRequestId", "createdAt", "updatedAt")
			 VALUES ($1, $2, $3, $4, $5, $5)`,
			[commentId, validatedData.content, user.id, workRequest.id, now],
		)

		const commentResult = await db.query<Record<string, unknown>>(
			`SELECT c.*, u.name AS "user_name", u.email AS "user_email", u.image AS "user_image"
			 FROM "work_request_comment" c
			 LEFT JOIN "user" u ON u.id = c."userId"
			 WHERE c.id = $1`,
			[commentId],
		)
		const comment = commentResult.rows[0]

		if (requestUser && requestUser.email && requestUser.id !== user.id) {
			try {
				await sendWorkRequestCommentNotification({
					userEmail: requestUser.email,
					userName: requestUser.name || "Usuario",
					commenterName: user.name || "Un usuario",
					requestNumber: workRequest.requestNumber,
					description: workRequest.description,
					commentContent: validatedData.content,
				})
			} catch {
				// email best-effort
			}
		}

		try {
			await logActivity({
				userId: user.id,
				module: MODULES.WORK_REQUESTS,
				action: ACTIVITY_TYPE.COMMENT,
				entityId: workRequest.id,
				entityType: "WorkRequestComment",
				metadata: {
					content: validatedData.content,
					workRequestId: validatedData.workRequestId,
					userId: user.id,
				},
			})
		} catch {
			// audit best-effort
		}

		return {
			success: "Comentario agregado correctamente",
			comment: {
				...comment,
				user: {
					name: comment?.user_name,
					email: comment?.user_email,
					image: comment?.user_image,
				},
			},
		}
	} catch (error) {
		console.error("Error al agregar el comentario:", error)
		if (error instanceof z.ZodError) {
			return { error: error.issues[0]?.message || "Error en los datos proporcionados" }
		}
		return { error: "Error al agregar el comentario" }
	}
}
