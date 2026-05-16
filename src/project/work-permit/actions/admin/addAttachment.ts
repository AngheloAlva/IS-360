import { ACTIVITY_TYPE, MODULES } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { getDemoUser } from "@/lib/demo-auth"
import { getDemoDb } from "@/lib/demo-db/client"
import {
	getScopedWorkPermitId,
	hasWorkPermitUpdatePermission,
} from "@/project/work-permit/utils/authorization"

import type { WorkPermitAttachmentSchema } from "@/project/work-permit/schemas/work-permit-attachment.schema"
import type { UploadResult } from "@/lib/upload-files"

export const addWorkPermitAttachment = async (
	values: WorkPermitAttachmentSchema,
	uploadedFile: UploadResult,
) => {
	const user = getDemoUser()
	if (!user) {
		return { ok: false, message: "No autorizado" }
	}

	try {
		const { workPermitId } = values

		const hasPermission = await hasWorkPermitUpdatePermission(user.id)
		if (!hasPermission) {
			return { ok: false, message: "No tienes permisos para adjuntar archivos" }
		}

		const scopedId = await getScopedWorkPermitId({ workPermitId, userId: user.id })
		if (!scopedId) {
			return { ok: false, message: "Permiso de trabajo no encontrado" }
		}

		const db = await getDemoDb()
		const id = crypto.randomUUID()
		const now = new Date().toISOString()

		const insertResult = await db.query<{
			id: string
			name: string
			url: string
			type: string
			size: number | null
			uploadedAt: string
			workPermitId: string
			uploadedById: string
		}>(
			`INSERT INTO "work_permit_attachment" (
				id, name, url, type, size, "uploadedAt", "uploadedById", "workPermitId",
				"createdAt", "updatedAt"
			) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $6, $6)
			 RETURNING id, name, url, type, size, "uploadedAt", "workPermitId", "uploadedById"`,
			[id, uploadedFile.name, uploadedFile.url, uploadedFile.type, uploadedFile.size, now, user.id, scopedId],
		)
		const attachment = insertResult.rows[0]

		try {
			await logActivity({
				userId: user.id,
				module: MODULES.WORK_PERMITS,
				action: ACTIVITY_TYPE.UPLOAD,
				entityId: attachment.id,
				entityType: "WorkPermitAttachment",
				metadata: {
					name: attachment.name,
					url: attachment.url,
					type: attachment.type,
					size: attachment.size,
					uploadedAt: attachment.uploadedAt,
					workPermitId: attachment.workPermitId,
					uploadedById: attachment.uploadedById,
				},
			})
		} catch {
			// audit best-effort
		}

		return { ok: true, message: "Archivo adjuntado exitosamente" }
	} catch (error) {
		console.error("[ADD_WORK_PERMIT_ATTACHMENT]", error)
		return { ok: false, message: "Error al adjuntar el archivo" }
	}
}
