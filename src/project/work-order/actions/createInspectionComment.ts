import { sendInspectionCommentNotification } from "./sendInspectionCommentNotification"
import { ACTIVITY_TYPE, MODULES, INSPECTION_COMMENT_TYPE } from "@/generated/prisma/enums"
import { UploadResult as UploadFilesResult } from "@/lib/upload-files"
import { logActivity } from "@/lib/activity/log"
import { getDemoUser } from "@/lib/demo-auth"
import { getDemoDb } from "@/lib/demo-db/client"

interface CreateInspectionCommentProps {
	workEntryId: string
	content: string
	type: INSPECTION_COMMENT_TYPE
	attachment?: UploadFilesResult[]
}

// TODO(iter X): full implementation — work_book_entry status sync on approval/rejection
export const createInspectionComment = async ({
	workEntryId,
	content,
	type,
	attachment,
}: CreateInspectionCommentProps) => {
	const user = getDemoUser()
	if (!user) {
		return { ok: false, message: "No autorizado" }
	}

	try {
		const db = await getDemoDb()
		const id = crypto.randomUUID()
		const now = new Date().toISOString()

		await db.query(
			`INSERT INTO "inspection_comment" ("id", "content", "type", "createdAt", "updatedAt", "authorId", "workEntryId")
			 VALUES ($1, $2, $3, $4, $4, $5, $6)`,
			[id, content, type, now, user.id, workEntryId]
		)

		if (attachment?.length) {
			for (const a of attachment) {
				await db.query(
					`INSERT INTO "attachment" ("id", "name", "url", "type", "createdAt", "updatedAt", "workEntryId")
					 VALUES ($1, $2, $3, $4, $5, $5, $6)`,
					[crypto.randomUUID(), a.name, a.url, a.type, now, workEntryId]
				)
			}
		}

		try {
			await logActivity({
				userId: user.id,
				module: MODULES.WORK_ORDERS,
				action: ACTIVITY_TYPE.COMMENT,
				entityId: id,
				entityType: "InspectionComment",
				metadata: { workEntryId, type },
			})
		} catch {
			// audit best-effort
		}

		await sendInspectionCommentNotification({ commentId: id, workEntryId })

		return { ok: true, message: "Comentario creado exitosamente" }
	} catch (error) {
		console.error("[CREATE_INSPECTION_COMMENT]", error)
		return { ok: false, message: "Error al crear el comentario" }
	}
}
