import { ACTIVITY_TYPE, MODULES } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { getDemoUser } from "@/lib/demo-auth"
import { getDemoDb } from "@/lib/demo-db/client"

import { deleteGuideDocumentSchema } from "../../schemas/guide-document.schema"

interface DeleteGuideDocumentProps {
	id: string
}

export const deleteGuideDocument = async ({ id }: DeleteGuideDocumentProps) => {
	const user = getDemoUser()
	if (!user) {
		return { ok: false, message: "No autorizado" }
	}

	try {
		const validatedData = deleteGuideDocumentSchema.parse({ id })
		const db = await getDemoDb()

		const existingRes = await db.query<{ id: string; name: string; visibility: string }>(
			`SELECT id, name, visibility FROM "startup_guide_document" WHERE id = $1 LIMIT 1`,
			[validatedData.id],
		)
		const existingDocument = existingRes.rows[0]
		if (!existingDocument) {
			return { ok: false, message: "Documento guía no encontrado" }
		}

		const now = new Date().toISOString()
		await db.query(
			`UPDATE "startup_guide_document" SET "isActive" = false, "updatedAt" = $1 WHERE id = $2`,
			[now, validatedData.id],
		)

		try {
			await logActivity({
				userId: user.id,
				module: MODULES.STARTUP_FOLDERS,
				action: ACTIVITY_TYPE.DELETE,
				entityId: validatedData.id,
				entityType: "StartupGuideDocument",
				metadata: {
					name: existingDocument.name,
					visibility: existingDocument.visibility,
				},
			})
		} catch {
			// audit best-effort
		}

		return { ok: true, message: "Documento guía eliminado correctamente" }
	} catch (error) {
		console.error("Error al eliminar documento guía:", error)
		return { ok: false, message: "Error al eliminar el documento guía" }
	}
}
