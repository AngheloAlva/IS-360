import { ACTIVITY_TYPE, DocumentCategory, MODULES, ReviewStatus } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { getDemoUser } from "@/lib/demo-auth"
import { getDemoDb } from "@/lib/demo-db/client"

import { recomputeSubfolderStatus } from "./recompute-subfolder-status"

interface AddDocumentReviewProps {
	comments: string
	documentId: string
	startupFolderId: string
	category: DocumentCategory
	status: "APPROVED" | "REJECTED" | "NOT_APPLIED"
}

interface ReviewedDocumentRef {
	workerId?: string
	vehicleId?: string
	isDriver?: boolean
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

function toReviewStatus(status: AddDocumentReviewProps["status"]): ReviewStatus {
	if (status === "APPROVED") return ReviewStatus.APPROVED
	if (status === "NOT_APPLIED") return ReviewStatus.NOT_APPLIED
	return ReviewStatus.REJECTED
}

async function updateDocumentReviewByCategory(
	category: DocumentCategory,
	documentId: string,
	comments: string,
	reviewerId: string,
	newStatus: ReviewStatus,
	now: string,
): Promise<ReviewedDocumentRef> {
	const cfg = CATEGORY_CONFIG[category]
	if (!cfg) return {}

	const db = await getDemoDb()
	await db.query(
		`UPDATE "${cfg.documentTable}"
		 SET status = $1, "reviewNotes" = $2, "reviewedAt" = $3, "reviewerId" = $4
		 WHERE id = $5`,
		[newStatus, comments, now, reviewerId, documentId],
	)

	if (!cfg.entityField) return {}

	const isDriverSelect = category === DocumentCategory.PERSONNEL ? `, f."isDriver"` : ""
	const res = await db.query<{ entityId: string; isDriver?: boolean }>(
		`SELECT f."${cfg.entityField}" AS "entityId"${isDriverSelect}
		 FROM "${cfg.documentTable}" d
		 JOIN "${cfg.folderTable}" f ON f.id = d."folderId"
		 WHERE d.id = $1 LIMIT 1`,
		[documentId],
	)
	const row = res.rows[0]
	if (!row) return {}

	if (cfg.entityField === "workerId") {
		return { workerId: row.entityId, isDriver: row.isDriver }
	}
	return { vehicleId: row.entityId }
}

export const addDocumentReview = async ({
	status,
	category,
	comments,
	documentId,
	startupFolderId,
}: AddDocumentReviewProps): Promise<{ ok: boolean; message: string }> => {
	const user = getDemoUser()
	if (!user) {
		return { ok: false, message: "No se encontro usuario" }
	}

	try {
		const reviewerId = user.id
		const now = new Date().toISOString()
		const newStatus = toReviewStatus(status)

		try {
			await logActivity({
				userId: reviewerId,
				module: MODULES.STARTUP_FOLDERS,
				action:
					newStatus === ReviewStatus.APPROVED
						? ACTIVITY_TYPE.APPROVE
						: newStatus === ReviewStatus.NOT_APPLIED
							? ACTIVITY_TYPE.UPDATE
							: ACTIVITY_TYPE.REJECT,
				entityId: documentId,
				entityType: "StartupFolderDocument",
				metadata: { category, comments, startupFolderId },
			})
		} catch {
			// audit best-effort
		}

		const refs = await updateDocumentReviewByCategory(
			category,
			documentId,
			comments,
			reviewerId,
			newStatus,
			now,
		)

		const recomputeResult = await recomputeSubfolderStatus({
			category,
			startupFolderId,
			workerId: refs.workerId,
			vehicleId: refs.vehicleId,
		})

		if (!recomputeResult.ok) {
			throw new Error(recomputeResult.message ?? "No se pudo recomputar el estado de la subcarpeta")
		}

		return { ok: true, message: "Revision procesada exitosamente" }
	} catch (error) {
		console.error("Error al procesar revision de documento:", error)
		if (error instanceof Error) {
			return { ok: false, message: `Error al procesar la revision: ${error.message}` }
		}
		return { ok: false, message: "Ocurrio un error inesperado al procesar la revision" }
	}
}
