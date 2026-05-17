import { ACTIVITY_TYPE, MODULES } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { getDemoDb } from "@/lib/demo-db/client"

interface UndoDocumentReviewParams {
	userId: string
	documentIds: string[]
}

export async function undoDocumentReview({ userId, documentIds }: UndoDocumentReviewParams) {
	if (!documentIds.length) {
		return { ok: false, message: "No se encontraron documentos" }
	}

	try {
		const db = await getDemoDb()
		const now = new Date().toISOString()
		const placeholders = documentIds.map((_, i) => `$${i + 2}`).join(", ")

		const updateRes = await db.query<{ id: string; folderId: string }>(
			`UPDATE "WorkerLaborControlDocument"
			 SET status = 'SUBMITTED', "updatedAt" = $1
			 WHERE id IN (${placeholders})
			 RETURNING id, "folderId"`,
			[now, ...documentIds],
		)
		const updatedCount = updateRes.rows.length
		if (updatedCount === 0) {
			return { ok: false, message: "No se encontraron documentos" }
		}

		const folderIds = [...new Set(updateRes.rows.map((d) => d.folderId))]
		const folderPlaceholders = folderIds.map((_, i) => `$${i + 2}`).join(", ")
		await db.query(
			`UPDATE "WorkerLaborControlFolder"
			 SET status = 'SUBMITTED', "updatedAt" = $1
			 WHERE id IN (${folderPlaceholders})`,
			[now, ...folderIds],
		)

		for (const document of updateRes.rows) {
			await logActivity({
				userId,
				entityId: document.id,
				action: ACTIVITY_TYPE.UPDATE,
				module: MODULES.LABOR_CONTROL_FOLDERS,
				entityType: "WorkerLaborControlDocument",
				metadata: { documentId: document.id, folderId: document.folderId },
			})
		}

		return {
			ok: true,
			message: `${updatedCount} documento(s) actualizado(s) correctamente`,
		}
	} catch (error) {
		console.error("Error updating document status:", error)
		return { ok: false, message: "Error al actualizar los documentos" }
	}
}
