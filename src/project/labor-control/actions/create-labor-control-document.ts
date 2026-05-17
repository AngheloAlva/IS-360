import { z } from "zod"

import { MODULES, ACTIVITY_TYPE, type LABOR_CONTROL_DOCUMENT_TYPE } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { getDemoDb } from "@/lib/demo-db/client"

const createDocumentSchema = z.object({
	url: z.string(),
	userId: z.string(),
	folderId: z.string(),
	documentType: z.string(),
	documentName: z.string(),
})

export type CreateLaborControlDocumentInput = z.infer<typeof createDocumentSchema>

export async function createLaborControlDocument(
	input: CreateLaborControlDocumentInput,
): Promise<{ ok: boolean; message?: string }> {
	try {
		const { url, userId, folderId, documentName, documentType } =
			createDocumentSchema.parse(input)
		const db = await getDemoDb()

		const folderRes = await db.query<{ id: string; companyId: string }>(
			`SELECT id, "companyId" FROM "LaborControlFolder" WHERE id = $1`,
			[folderId],
		)
		const folder = folderRes.rows[0]
		if (!folder) {
			throw new Error("Folder not found")
		}

		const userRes = await db.query<{ id: string; companyId: string | null }>(
			`SELECT id, "companyId" FROM "user" WHERE id = $1`,
			[userId],
		)
		const user = userRes.rows[0]
		if (!user || user.companyId !== folder.companyId) {
			throw new Error("Unauthorized - User does not belong to this company")
		}

		const id = crypto.randomUUID()
		const now = new Date().toISOString()
		await db.query(
			`INSERT INTO "LaborControlDocument" (
				"id", "url", "folderId", "name", "uploadById", "type",
				"status", "uploadDate", "updatedAt"
			) VALUES ($1, $2, $3, $4, $5, $6, 'DRAFT', $7, $7)`,
			[id, url, folderId, documentName, userId, documentType as LABOR_CONTROL_DOCUMENT_TYPE, now],
		)

		await logActivity({
			userId,
			entityId: folderId,
			action: ACTIVITY_TYPE.UPLOAD,
			module: MODULES.LABOR_CONTROL_FOLDERS,
			entityType: "LaborControlDocument",
			metadata: { folderId, documentName, documentType, documentUrl: url },
		})

		return { ok: true, message: "Document created successfully" }
	} catch (error) {
		console.error(error)
		return { ok: false, message: "Error al crear el documento" }
	}
}
