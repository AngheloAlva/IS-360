import { z } from "zod"

import {
	ACTIVITY_TYPE,
	MODULES,
	type WORKER_LABOR_CONTROL_DOCUMENT_TYPE,
} from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { getDemoDb } from "@/lib/demo-db/client"

const createWorkerDocumentSchema = z.object({
	url: z.string(),
	userId: z.string(),
	workerId: z.string(),
	folderId: z.string(),
	documentType: z.string(),
	documentName: z.string(),
})

export type CreateWorkerDocumentInput = z.infer<typeof createWorkerDocumentSchema>

export async function createWorkerDocument(
	input: CreateWorkerDocumentInput,
): Promise<{ ok: boolean; message?: string }> {
	try {
		const { userId, workerId, documentType, documentName, url, folderId } =
			createWorkerDocumentSchema.parse(input)
		const db = await getDemoDb()

		const folderRes = await db.query<{
			id: string
			worker_companyId: string | null
		}>(
			`SELECT wlcf.id, u."companyId" AS "worker_companyId"
			 FROM "WorkerLaborControlFolder" wlcf
			 LEFT JOIN "user" u ON u.id = wlcf."workerId"
			 WHERE wlcf.id = $1`,
			[folderId],
		)
		const folder = folderRes.rows[0]
		if (!folder) {
			return { ok: false, message: "Carpeta de personal no encontrada" }
		}

		const userRes = await db.query<{ companyId: string | null }>(
			`SELECT "companyId" FROM "user" WHERE id = $1`,
			[userId],
		)
		const user = userRes.rows[0]
		if (!user || user.companyId !== folder.worker_companyId) {
			return { ok: false, message: "No autorizado - El usuario no pertenece a la empresa" }
		}

		const id = crypto.randomUUID()
		const now = new Date().toISOString()
		await db.query(
			`INSERT INTO "WorkerLaborControlDocument" (
				"id", "url", "name", "uploadById", "folderId", "type",
				"status", "uploadDate", "updatedAt"
			) VALUES ($1, $2, $3, $4, $5, $6, 'DRAFT', $7, $7)`,
			[id, url, documentName, userId, folderId, documentType as WORKER_LABOR_CONTROL_DOCUMENT_TYPE, now],
		)

		await logActivity({
			userId,
			module: MODULES.STARTUP_FOLDERS,
			action: ACTIVITY_TYPE.UPLOAD,
			entityId: id,
			entityType: "BasicDocument",
			metadata: { folderId, workerId, documentType, documentName, documentUrl: url },
		})

		return { ok: true, message: "Documento de personal subido correctamente" }
	} catch (error) {
		console.error(error)
		return { ok: false, message: "Ocurrio un error subiendo el documento" }
	}
}
