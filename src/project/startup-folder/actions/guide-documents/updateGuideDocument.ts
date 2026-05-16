import { ACTIVITY_TYPE, MODULES } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { getDemoUser } from "@/lib/demo-auth"
import { getDemoDb } from "@/lib/demo-db/client"

import {
	updateGuideDocumentSchema,
	type UpdateGuideDocumentInput,
} from "../../schemas/guide-document.schema"

export const updateGuideDocument = async (data: UpdateGuideDocumentInput) => {
	const user = getDemoUser()
	if (!user) {
		return { ok: false, message: "No autorizado" }
	}

	try {
		const validatedData = updateGuideDocumentSchema.parse(data)
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
			`UPDATE "startup_guide_document"
			 SET name = $1, description = $2, url = $3, type = $4, size = $5,
			     visibility = $6, "order" = $7, "updatedAt" = $8
			 WHERE id = $9`,
			[
				validatedData.name,
				validatedData.description ?? null,
				validatedData.url,
				validatedData.type,
				validatedData.size ?? null,
				validatedData.visibility,
				validatedData.order ?? 0,
				now,
				validatedData.id,
			],
		)

		const updatedRes = await db.query(`SELECT * FROM "startup_guide_document" WHERE id = $1`, [
			validatedData.id,
		])
		const guideDocument = updatedRes.rows[0]

		try {
			await logActivity({
				userId: user.id,
				module: MODULES.STARTUP_FOLDERS,
				action: ACTIVITY_TYPE.UPDATE,
				entityId: validatedData.id,
				entityType: "StartupGuideDocument",
				metadata: {
					name: validatedData.name,
					visibility: validatedData.visibility,
					previousName: existingDocument.name,
				},
			})
		} catch {
			// audit best-effort
		}

		return {
			ok: true,
			message: "Documento guía actualizado correctamente",
			data: guideDocument,
		}
	} catch (error) {
		console.error("Error al actualizar documento guía:", error)
		return { ok: false, message: "Error al actualizar el documento guía" }
	}
}
