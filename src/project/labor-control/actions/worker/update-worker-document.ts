import {
	LABOR_CONTROL_STATUS,
	type WORKER_LABOR_CONTROL_DOCUMENT_TYPE,
} from "@/generated/prisma/enums"
import { getDemoDb } from "@/lib/demo-db/client"

import type { UpdateWorkerDocumentSchema } from "@/project/labor-control/schemas/update-file.schema"
import type { UploadResult } from "@/lib/upload-files"

export const updateWorkerDocument = async ({
	data: { documentId, documentName, documentType },
	uploadedFile,
	userId,
}: {
	data: UpdateWorkerDocumentSchema
	uploadedFile: UploadResult
	userId: string
}) => {
	try {
		const db = await getDemoDb()

		const existingRes = await db.query<{ folderStatus: LABOR_CONTROL_STATUS | null }>(
			`SELECT lcf.status AS "folderStatus"
			 FROM "WorkerLaborControlDocument" d
			 LEFT JOIN "WorkerLaborControlFolder" lcf ON lcf.id = d."folderId"
			 WHERE d.id = $1`,
			[documentId],
		)
		const existing = existingRes.rows[0]
		if (!existing) {
			return { ok: false, message: "Documento no encontrado" }
		}
		if (existing.folderStatus === LABOR_CONTROL_STATUS.APPROVED) {
			return {
				ok: false,
				message: "No puedes modificar documentos en esta carpeta porque ya fue aprobada",
			}
		}

		const now = new Date().toISOString()
		const updateRes = await db.query<Record<string, unknown>>(
			`UPDATE "WorkerLaborControlDocument"
			 SET name = $1, url = $2, "uploadDate" = $3, status = $4, type = $5,
			     "uploadById" = $6, "updatedAt" = $3
			 WHERE id = $7
			 RETURNING *`,
			[
				documentName,
				uploadedFile.url,
				now,
				LABOR_CONTROL_STATUS.DRAFT,
				documentType as WORKER_LABOR_CONTROL_DOCUMENT_TYPE,
				userId,
				documentId,
			],
		)

		return { ok: true, data: updateRes.rows[0] }
	} catch (error) {
		console.error("Error al actualizar documento:", error)
		return { ok: false, message: "Error al procesar la solicitud" }
	}
}
