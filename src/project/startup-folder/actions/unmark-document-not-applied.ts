import {
	ACTIVITY_TYPE,
	DocumentCategory,
	MODULES,
	ReviewStatus,
} from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { getDemoUser } from "@/lib/demo-auth"
import { getDemoDb } from "@/lib/demo-db/client"

import {
	unmarkDocumentAsNotAppliedSchema,
	type UnmarkDocumentAsNotAppliedInput,
} from "../schemas/unmark-document-not-applied.schema"

interface CategoryConfig {
	folderTable: string
	documentTable: string
	entityField?: "workerId" | "vehicleId"
}

const CATEGORY_CONFIG: Record<DocumentCategory, CategoryConfig> = {
	[DocumentCategory.SAFETY_AND_HEALTH]: {
		folderTable: "safety_and_health_folder",
		documentTable: "safety_and_health_document",
	},
	[DocumentCategory.ENVIRONMENTAL]: {
		folderTable: "environmental_folder",
		documentTable: "environmental_document",
	},
	[DocumentCategory.ENVIRONMENT]: {
		folderTable: "environment_folder",
		documentTable: "environment_document",
	},
	[DocumentCategory.TECHNICAL_SPECS]: {
		folderTable: "tech_specs_folder",
		documentTable: "tech_specs_document",
	},
	[DocumentCategory.PERSONNEL]: {
		folderTable: "worker_folders",
		documentTable: "worker_document",
		entityField: "workerId",
	},
	[DocumentCategory.VEHICLES]: {
		folderTable: "vehicle_folders",
		documentTable: "vehicle_document",
		entityField: "vehicleId",
	},
	[DocumentCategory.BASIC]: {
		folderTable: "basic_folder",
		documentTable: "basic_document",
		entityField: "workerId",
	},
}

export async function unmarkStartupFolderDocumentAsNotApplied(
	input: UnmarkDocumentAsNotAppliedInput,
): Promise<{ ok: boolean; message?: string }> {
	try {
		const user = getDemoUser()
		if (!user) {
			return { ok: false, message: "No se encontró usuario" }
		}

		const { userId, folderId, documentId, category, workerId, vehicleId } =
			unmarkDocumentAsNotAppliedSchema.parse(input)

		const db = await getDemoDb()

		const startupRes = await db.query<{ id: string; companyId: string }>(
			`SELECT id, "companyId" FROM "startup_folder" WHERE id = $1 LIMIT 1`,
			[folderId],
		)
		const startupFolder = startupRes.rows[0]
		if (!startupFolder) {
			return { ok: false, message: "Carpeta de arranque no encontrada" }
		}

		const userRes = await db.query<{ companyId: string | null; accessRole: string }>(
			`SELECT "companyId", "accessRole" FROM "user" WHERE id = $1 LIMIT 1`,
			[userId],
		)
		const userRow = userRes.rows[0]
		if (
			!userRow ||
			(userRow.companyId !== startupFolder.companyId && userRow.accessRole !== "ADMIN")
		) {
			return { ok: false, message: "No autorizado - El usuario no pertenece a esta empresa" }
		}

		const cfg = CATEGORY_CONFIG[category as DocumentCategory]
		if (!cfg) {
			return { ok: false, message: `Categoría no soportada: ${category}` }
		}

		let folderRowRes
		if (cfg.entityField === "workerId") {
			if (!workerId) return { ok: false, message: "ID de trabajador requerido" }
			folderRowRes = await db.query<{ id: string }>(
				`SELECT id FROM "${cfg.folderTable}" WHERE "workerId" = $1 AND "startupFolderId" = $2 LIMIT 1`,
				[workerId, folderId],
			)
		} else if (cfg.entityField === "vehicleId") {
			if (!vehicleId) return { ok: false, message: "ID de vehículo requerido" }
			folderRowRes = await db.query<{ id: string }>(
				`SELECT id FROM "${cfg.folderTable}" WHERE "vehicleId" = $1 AND "startupFolderId" = $2 LIMIT 1`,
				[vehicleId, folderId],
			)
		} else {
			folderRowRes = await db.query<{ id: string }>(
				`SELECT id FROM "${cfg.folderTable}" WHERE "startupFolderId" = $1 LIMIT 1`,
				[folderId],
			)
		}

		const folder = folderRowRes.rows[0]
		if (!folder) {
			return { ok: false, message: "Subcarpeta no encontrada" }
		}

		const docRes = await db.query<{
			id: string
			name: string
			type: string
			status: ReviewStatus
		}>(
			`SELECT id, name, type, status FROM "${cfg.documentTable}"
			 WHERE id = $1 AND "folderId" = $2 LIMIT 1`,
			[documentId, folder.id],
		)
		const document = docRes.rows[0]
		if (!document) {
			return { ok: false, message: "Documento no encontrado" }
		}
		if (document.status !== ReviewStatus.NOT_APPLIED) {
			return { ok: false, message: "Solo se puede revertir documentos en estado 'No Aplica'" }
		}

		await db.query(`DELETE FROM "${cfg.documentTable}" WHERE id = $1`, [document.id])

		try {
			await logActivity({
				userId,
				entityId: document.id,
				action: ACTIVITY_TYPE.DELETE,
				module: MODULES.STARTUP_FOLDERS,
				entityType: "StartupFolderDocument",
				metadata: {
					folderId,
					category,
					workerId,
					vehicleId,
					documentName: document.name,
					documentType: document.type,
					status: "NOT_UPLOADED",
					action: "unmarked_not_applied",
				},
			})
		} catch {
			// audit best-effort
		}

		return {
			ok: true,
			message: "Documento revertido de 'No Aplica' a 'No subido' exitosamente",
		}
	} catch (error) {
		console.error("Error al revertir documento No Aplica:", error)
		return { ok: false, message: "Error al procesar la solicitud" }
	}
}
