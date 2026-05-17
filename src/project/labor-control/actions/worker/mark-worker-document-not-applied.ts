import {
	MODULES,
	ACTIVITY_TYPE,
	LABOR_CONTROL_STATUS,
	type WORKER_LABOR_CONTROL_DOCUMENT_TYPE,
} from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { getDemoUser } from "@/lib/demo-auth"
import { getDemoDb } from "@/lib/demo-db/client"
import {
	markDocumentAsNotAppliedSchema,
	type MarkDocumentAsNotAppliedInput,
} from "../../schemas/mark-document-not-applied.schema"

export async function markWorkerLaborControlDocumentAsNotApplied(
	input: MarkDocumentAsNotAppliedInput,
): Promise<{ ok: boolean; message?: string }> {
	const sessionUser = getDemoUser()
	if (!sessionUser) {
		return { ok: false, message: "No se encontró usuario" }
	}

	try {
		const { userId, folderId, documentType, documentName, workerId } =
			markDocumentAsNotAppliedSchema.parse(input)

		if (!workerId) {
			return { ok: false, message: "ID de trabajador requerido" }
		}

		const db = await getDemoDb()
		const folderRes = await db.query<{ id: string; worker_companyId: string | null }>(
			`SELECT wlcf.id, u."companyId" AS "worker_companyId"
			 FROM "WorkerLaborControlFolder" wlcf
			 LEFT JOIN "user" u ON u.id = wlcf."workerId"
			 WHERE wlcf.id = $1`,
			[folderId],
		)
		const folder = folderRes.rows[0]
		if (!folder) {
			return { ok: false, message: "Carpeta de trabajador no encontrada" }
		}

		const userRes = await db.query<{ companyId: string | null; accessRole: string }>(
			`SELECT "companyId", "accessRole" FROM "user" WHERE id = $1`,
			[userId],
		)
		const user = userRes.rows[0]
		if (
			!user ||
			(user.companyId !== folder.worker_companyId && user.accessRole !== "ADMIN")
		) {
			return { ok: false, message: "No autorizado - El usuario no pertenece a esta empresa" }
		}

		const existing = await db.query<{ id: string }>(
			`SELECT id FROM "WorkerLaborControlDocument" WHERE "folderId" = $1 AND type = $2 LIMIT 1`,
			[folderId, documentType as WORKER_LABOR_CONTROL_DOCUMENT_TYPE],
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
			`INSERT INTO "WorkerLaborControlDocument" (
				"id", "url", "name", "uploadById", "folderId", "type",
				"status", "uploadDate", "updatedAt"
			) VALUES ($1, '', $2, $3, $4, $5, $6, $7, $7)`,
			[
				id,
				documentName,
				userId,
				folderId,
				documentType as WORKER_LABOR_CONTROL_DOCUMENT_TYPE,
				LABOR_CONTROL_STATUS.NOT_APPLIED,
				now,
			],
		)

		await logActivity({
			userId,
			module: MODULES.LABOR_CONTROL_FOLDERS,
			action: ACTIVITY_TYPE.UPDATE,
			entityId: id,
			entityType: "WorkerLaborControlDocument",
			metadata: {
				folderId,
				workerId,
				documentType,
				documentName,
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
