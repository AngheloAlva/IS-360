import { ACTIVITY_TYPE, MODULES } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { getDemoUser } from "@/lib/demo-auth"
import { getDemoDb } from "@/lib/demo-db/client"

import { guideDocumentSchema, type GuideDocumentInput } from "../../schemas/guide-document.schema"

export const createGuideDocument = async (data: GuideDocumentInput) => {
	const user = getDemoUser()
	if (!user) {
		return { ok: false, message: "No autorizado" }
	}

	try {
		const validatedData = guideDocumentSchema.parse(data)
		const db = await getDemoDb()
		const id = crypto.randomUUID()
		const now = new Date().toISOString()

		await db.query(
			`INSERT INTO "startup_guide_document"
			 (id, name, description, url, type, size, visibility, "order", "isActive", "createdById", "createdAt", "updatedAt")
			 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, $9, $10, $10)`,
			[
				id,
				validatedData.name,
				validatedData.description ?? null,
				validatedData.url,
				validatedData.type,
				validatedData.size ?? null,
				validatedData.visibility,
				validatedData.order ?? 0,
				user.id,
				now,
			],
		)

		const res = await db.query(`SELECT * FROM "startup_guide_document" WHERE id = $1`, [id])
		const guideDocument = res.rows[0]

		try {
			await logActivity({
				userId: user.id,
				module: MODULES.STARTUP_FOLDERS,
				action: ACTIVITY_TYPE.CREATE,
				entityId: id,
				entityType: "StartupGuideDocument",
				metadata: {
					name: validatedData.name,
					visibility: validatedData.visibility,
				},
			})
		} catch {
			// audit best-effort
		}

		return {
			ok: true,
			message: "Documento guía creado correctamente",
			data: guideDocument,
		}
	} catch (error) {
		console.error("Error al crear documento guía:", error)
		return { ok: false, message: "Error al crear el documento guía" }
	}
}
