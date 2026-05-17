import {
	MODULES,
	ACTIVITY_TYPE,
	LABOR_CONTROL_STATUS,
	type LABOR_CONTROL_DOCUMENT_TYPE,
} from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { getDemoUser } from "@/lib/demo-auth"
import { getDemoDb } from "@/lib/demo-db/client"
import {
	markDocumentAsNotAppliedSchema,
	type MarkDocumentAsNotAppliedInput,
} from "../schemas/mark-document-not-applied.schema"

export async function markLaborControlDocumentAsNotApplied(
	input: MarkDocumentAsNotAppliedInput,
): Promise<{ ok: boolean; message?: string }> {
	const sessionUser = getDemoUser()
	if (!sessionUser) {
		return { ok: false, message: "No se encontró usuario" }
	}

	try {
		const { userId, folderId, documentType, documentName } =
			markDocumentAsNotAppliedSchema.parse(input)
		const db = await getDemoDb()

		const folderRes = await db.query<{ id: string; companyId: string }>(
			`SELECT id, "companyId" FROM "LaborControlFolder" WHERE id = $1`,
			[folderId],
		)
		const folder = folderRes.rows[0]
		if (!folder) {
			return { ok: false, message: "Carpeta no encontrada" }
		}

		const userRes = await db.query<{ companyId: string | null; accessRole: string }>(
			`SELECT "companyId", "accessRole" FROM "user" WHERE id = $1`,
			[userId],
		)
		const user = userRes.rows[0]
		if (!user || (user.companyId !== folder.companyId && user.accessRole !== "ADMIN")) {
			return { ok: false, message: "No autorizado - El usuario no pertenece a esta empresa" }
		}

		const existing = await db.query<{ id: string }>(
			`SELECT id FROM "LaborControlDocument" WHERE "folderId" = $1 AND type = $2 LIMIT 1`,
			[folderId, documentType as LABOR_CONTROL_DOCUMENT_TYPE],
		)
		if (existing.rows.length) {
			return {
				ok: false,
				message:
					"Ya existe un documento de este tipo. Elimínelo primero si desea marcarlo como No Aplica.",
			}
		}

		const id = crypto.randomUUID()
		const now = new Date().toISOString()
		await db.query(
			`INSERT INTO "LaborControlDocument" (
				"id", "url", "folderId", "name", "uploadById", "type",
				"status", "uploadDate", "updatedAt"
			) VALUES ($1, '', $2, $3, $4, $5, $6, $7, $7)`,
			[
				id,
				folderId,
				documentName,
				userId,
				documentType as LABOR_CONTROL_DOCUMENT_TYPE,
				LABOR_CONTROL_STATUS.NOT_APPLIED,
				now,
			],
		)

		await logActivity({
			userId,
			entityId: id,
			action: ACTIVITY_TYPE.UPDATE,
			module: MODULES.LABOR_CONTROL_FOLDERS,
			entityType: "LaborControlDocument",
			metadata: {
				folderId,
				documentName,
				documentType,
				status: "NOT_APPLIED",
				action: "marked_as_not_applied",
			},
		})

		return { ok: true, message: "Documento marcado como 'No Aplica' exitosamente" }
	} catch (error) {
		console.error("Error al marcar documento como No Aplica:", error)
		return { ok: false, message: "Error al procesar la solicitud" }
	}
}
