import { ACTIVITY_TYPE, DocumentCategory, MODULES, ReviewStatus } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { getDemoUser } from "@/lib/demo-auth"
import { getDemoDb } from "@/lib/demo-db/client"

import { recomputeSubfolderStatus } from "./recompute-subfolder-status"

interface RevertNotAppliedDocumentInput {
	documentId: string
	category: DocumentCategory
}

const CATEGORY_CONFIG: Record<
	DocumentCategory,
	{ folderTable: string; documentTable: string; entityField?: "workerId" | "vehicleId" }
> = {
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

export async function revertNotAppliedDocument({
	documentId,
	category,
}: RevertNotAppliedDocumentInput): Promise<{ ok: boolean; message: string }> {
	const user = getDemoUser()
	if (!user) {
		return { ok: false, message: "No autorizado" }
	}

	try {
		const cfg = CATEGORY_CONFIG[category]
		if (!cfg) {
			return { ok: false, message: "Categoria no soportada" }
		}

		const db = await getDemoDb()

		const entitySelect = cfg.entityField ? `, f."${cfg.entityField}" AS "entityId"` : ""
		const docRes = await db.query<{
			id: string
			status: ReviewStatus
			startupFolderId: string
			entityId: string | null
		}>(
			`SELECT d.id, d.status, f."startupFolderId"${entitySelect}
			 FROM "${cfg.documentTable}" d
			 JOIN "${cfg.folderTable}" f ON f.id = d."folderId"
			 WHERE d.id = $1 LIMIT 1`,
			[documentId],
		)
		const document = docRes.rows[0]

		if (!document || document.status !== ReviewStatus.NOT_APPLIED) {
			return { ok: false, message: "Documento no encontrado o no esta en No Aplica" }
		}

		await db.query(`DELETE FROM "${cfg.documentTable}" WHERE id = $1`, [documentId])

		await recomputeSubfolderStatus({
			category,
			startupFolderId: document.startupFolderId,
			workerId:
				cfg.entityField === "workerId" ? document.entityId ?? undefined : undefined,
			vehicleId:
				cfg.entityField === "vehicleId" ? document.entityId ?? undefined : undefined,
		})

		try {
			await logActivity({
				userId: user.id,
				module: MODULES.STARTUP_FOLDERS,
				action: ACTIVITY_TYPE.DELETE,
				entityId: documentId,
				entityType: "StartupFolderDocument",
				metadata: { category, status: "NOT_APPLIED", action: "revert" },
			})
		} catch {
			// audit best-effort
		}

		return { ok: true, message: "No Aplica revertido correctamente" }
	} catch (error) {
		console.error("Error al revertir documento No Aplica:", error)
		return { ok: false, message: "Error al revertir No Aplica" }
	}
}
