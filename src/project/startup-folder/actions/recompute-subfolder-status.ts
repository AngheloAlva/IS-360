import { DocumentCategory, ReviewStatus } from "@/generated/prisma/enums"
import { BASIC_FOLDER_STRUCTURE } from "@/lib/consts/basic-startup-folders-structure"
import {
	EXTENDED_ENVIRONMENT_STRUCTURE,
	ENVIRONMENT_STRUCTURE,
	ENVIRONMENTAL_STRUCTURE,
	SAFETY_AND_HEALTH_STRUCTURE,
	TECH_SPEC_STRUCTURE,
} from "@/lib/consts/startup-folders-structure"
import { VEHICLE_STRUCTURE } from "@/lib/consts/vehicle-folder-structure"
import {
	BASE_WORKER_STRUCTURE,
	DRIVER_WORKER_STRUCTURE,
} from "@/lib/consts/worker-folder-structure"
import { getDemoDb } from "@/lib/demo-db/client"

interface RecomputeSubfolderStatusInput {
	startupFolderId: string
	category: DocumentCategory
	workerId?: string
	vehicleId?: string
}

interface RecomputeSubfolderStatusResult {
	ok: boolean
	newStatus?: ReviewStatus
	message?: string
}

function resolveStatusByType(
	documents: { type: string; status: ReviewStatus }[],
	expectedTypes: string[],
): ReviewStatus {
	const bestStatusByType = new Map<string, ReviewStatus>()

	for (const doc of documents) {
		const current = bestStatusByType.get(doc.type)
		if (current === ReviewStatus.APPROVED || current === ReviewStatus.NOT_APPLIED) continue

		if (doc.status === ReviewStatus.APPROVED || doc.status === ReviewStatus.NOT_APPLIED) {
			bestStatusByType.set(doc.type, doc.status)
			continue
		}
		if (doc.status === ReviewStatus.SUBMITTED && current !== ReviewStatus.SUBMITTED) {
			bestStatusByType.set(doc.type, doc.status)
			continue
		}
		if (!current || current === ReviewStatus.DRAFT) {
			bestStatusByType.set(doc.type, doc.status)
		}
	}

	let approvedOrNotApplied = 0
	let hasSubmitted = false
	let hasRejected = false
	let hasDraft = false
	let hasExpired = false

	for (const expectedType of expectedTypes) {
		const status = bestStatusByType.get(expectedType)
		if (!status) {
			hasDraft = true
			continue
		}
		switch (status) {
			case ReviewStatus.APPROVED:
			case ReviewStatus.NOT_APPLIED:
				approvedOrNotApplied++
				break
			case ReviewStatus.SUBMITTED:
				hasSubmitted = true
				break
			case ReviewStatus.REJECTED:
				hasRejected = true
				break
			case ReviewStatus.EXPIRED:
			case ReviewStatus.TO_UPDATE:
				hasExpired = true
				break
			default:
				hasDraft = true
		}
	}

	if (hasSubmitted) return ReviewStatus.SUBMITTED
	if (hasRejected || hasDraft || hasExpired || approvedOrNotApplied < expectedTypes.length) {
		return ReviewStatus.DRAFT
	}
	return ReviewStatus.APPROVED
}

interface FolderResolverConfig {
	folderTable: string
	documentTable: string
	entityField?: "workerId" | "vehicleId"
	expectedTypes: string[] | ((row: { moreMonthDuration: boolean; isDriver: boolean }) => string[])
	needsStartupFolderMeta?: boolean
}

const STATIC_CONFIGS: Partial<Record<DocumentCategory, FolderResolverConfig>> = {
	[DocumentCategory.SAFETY_AND_HEALTH]: {
		folderTable: "safety_and_health_folder",
		documentTable: "safety_and_health_document",
		expectedTypes: SAFETY_AND_HEALTH_STRUCTURE.documents.map((d) => d.type),
	},
	[DocumentCategory.ENVIRONMENTAL]: {
		folderTable: "environmental_folder",
		documentTable: "environmental_document",
		expectedTypes: ENVIRONMENTAL_STRUCTURE.documents.map((d) => d.type),
	},
	[DocumentCategory.ENVIRONMENT]: {
		folderTable: "environment_folder",
		documentTable: "environment_document",
		expectedTypes: ({ moreMonthDuration }) =>
			(moreMonthDuration ? EXTENDED_ENVIRONMENT_STRUCTURE : ENVIRONMENT_STRUCTURE).documents.map(
				(d) => d.type,
			),
		needsStartupFolderMeta: true,
	},
	[DocumentCategory.TECHNICAL_SPECS]: {
		folderTable: "tech_specs_folder",
		documentTable: "tech_specs_document",
		expectedTypes: TECH_SPEC_STRUCTURE.documents.map((d) => d.type),
	},
	[DocumentCategory.PERSONNEL]: {
		folderTable: "worker_folders",
		documentTable: "worker_document",
		entityField: "workerId",
		expectedTypes: ({ isDriver }) =>
			(isDriver ? DRIVER_WORKER_STRUCTURE : BASE_WORKER_STRUCTURE).documents.map((d) => d.type),
	},
	[DocumentCategory.VEHICLES]: {
		folderTable: "vehicle_folders",
		documentTable: "vehicle_document",
		entityField: "vehicleId",
		expectedTypes: VEHICLE_STRUCTURE.documents.map((d) => d.type),
	},
	[DocumentCategory.BASIC]: {
		folderTable: "basic_folder",
		documentTable: "basic_document",
		entityField: "workerId",
		expectedTypes: BASIC_FOLDER_STRUCTURE.documents.map((d) => d.type),
	},
}

export async function recomputeSubfolderStatus({
	startupFolderId,
	category,
	workerId,
	vehicleId,
}: RecomputeSubfolderStatusInput): Promise<RecomputeSubfolderStatusResult> {
	try {
		const config = STATIC_CONFIGS[category]
		if (!config) {
			return { ok: false, message: `Categoria no soportada: ${category}` }
		}

		const db = await getDemoDb()
		const entityId = config.entityField === "workerId" ? workerId : vehicleId

		if (config.entityField && !entityId) {
			return {
				ok: false,
				message:
					config.entityField === "workerId"
						? "ID de trabajador requerido"
						: "ID de vehículo requerido",
			}
		}

		const folderQuery = config.entityField
			? `SELECT id, status${category === DocumentCategory.PERSONNEL ? `, "isDriver"` : ""}
			   FROM "${config.folderTable}"
			   WHERE "${config.entityField}" = $1 AND "startupFolderId" = $2 LIMIT 1`
			: `SELECT id, status FROM "${config.folderTable}" WHERE "startupFolderId" = $1 LIMIT 1`

		const folderParams = config.entityField ? [entityId, startupFolderId] : [startupFolderId]
		const folderRes = await db.query<{ id: string; status: ReviewStatus; isDriver?: boolean }>(
			folderQuery,
			folderParams,
		)
		const folder = folderRes.rows[0]
		if (!folder) return { ok: false, message: "Subcarpeta no encontrada" }

		let moreMonthDuration = false
		if (config.needsStartupFolderMeta) {
			const metaRes = await db.query<{ moreMonthDuration: boolean }>(
				`SELECT "moreMonthDuration" FROM "startup_folder" WHERE id = $1`,
				[startupFolderId],
			)
			moreMonthDuration = metaRes.rows[0]?.moreMonthDuration ?? false
		}

		const expectedTypes =
			typeof config.expectedTypes === "function"
				? config.expectedTypes({
						moreMonthDuration,
						isDriver: folder.isDriver ?? false,
					})
				: config.expectedTypes

		const docsRes = await db.query<{ type: string; status: ReviewStatus }>(
			`SELECT type, status FROM "${config.documentTable}" WHERE "folderId" = $1`,
			[folder.id],
		)

		const nextStatus = resolveStatusByType(docsRes.rows, expectedTypes)

		if (nextStatus !== folder.status) {
			await db.query(
				`UPDATE "${config.folderTable}" SET status = $1, "updatedAt" = $2 WHERE id = $3`,
				[nextStatus, new Date().toISOString(), folder.id],
			)
		}

		return { ok: true, newStatus: nextStatus }
	} catch (error) {
		console.error("Error recomputando estado de subcarpeta:", error)
		return { ok: false, message: "Error al recomputar estado" }
	}
}
