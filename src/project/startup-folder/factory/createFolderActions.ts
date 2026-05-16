import {
	ACCESS_ROLE,
	ACTIVITY_TYPE,
	DocumentCategory,
	MODULES,
	ReviewStatus,
} from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { getDemoDb } from "@/lib/demo-db/client"

import { recomputeSubfolderStatus } from "../actions/recompute-subfolder-status"
import {
	getSubmitRequester,
	isSubmittableFolderStatus,
	submitFolderDocuments,
} from "../actions/submit-review-helpers"
import { syncIrlSafetyTalkCertificate } from "../actions/sync-irl-safety-talk-certificate"

import type { UpdateExpirationDateSchema } from "../schemas/update-expiration-date"
import type { UpdateStartupFolderDocumentSchema } from "../schemas/update-file.schema"
import type { UploadResult } from "@/lib/upload-files"

import type { EntityFolderConfig, FolderConfig } from "./configs"

interface ActionResult<T = unknown> {
	ok: boolean
	message?: string
	data?: T
}

const now = () => new Date().toISOString()

function isEntityConfig(config: FolderConfig): config is EntityFolderConfig {
	return config.hasEntities
}

async function fetchFolderByCompound(
	config: EntityFolderConfig,
	entityId: string,
	startupFolderId: string,
) {
	const db = await getDemoDb()
	const res = await db.query<{ id: string; status: ReviewStatus }>(
		`SELECT id, status FROM "${config.folderTable}"
		 WHERE "${config.entityField}" = $1 AND "startupFolderId" = $2 LIMIT 1`,
		[entityId, startupFolderId],
	)
	return res.rows[0] ?? null
}

async function fetchFolderByStartup(config: FolderConfig, startupFolderId: string) {
	const db = await getDemoDb()
	const res = await db.query<{ id: string; status: ReviewStatus }>(
		`SELECT id, status FROM "${config.folderTable}" WHERE "startupFolderId" = $1 LIMIT 1`,
		[startupFolderId],
	)
	return res.rows[0] ?? null
}

async function fetchEntityCompany(config: EntityFolderConfig, entityId: string) {
	const db = await getDemoDb()
	const res = await db.query<{ companyId: string | null }>(
		`SELECT "companyId" FROM "${config.entityTable}" WHERE id = $1 LIMIT 1`,
		[entityId],
	)
	return res.rows[0]?.companyId ?? null
}

async function fetchUserCompany(userId: string) {
	const db = await getDemoDb()
	const res = await db.query<{ companyId: string | null; accessRole: string }>(
		`SELECT "companyId", "accessRole" FROM "user" WHERE id = $1 LIMIT 1`,
		[userId],
	)
	return res.rows[0] ?? null
}

/* ---------------- 1. createDocument ---------------- */

export interface CreateDocumentInput {
	url: string
	userId: string
	documentType: string
	documentName: string
	expirationDate: Date
	startupFolderId: string
	workerId?: string
	vehicleId?: string
}

export async function createDocument(
	config: EntityFolderConfig,
	input: CreateDocumentInput,
): Promise<ActionResult> {
	try {
		const entityId = config.entityField === "workerId" ? input.workerId : input.vehicleId
		if (!entityId) return { ok: false, message: config.successMessages.notFound }

		const folder = await fetchFolderByCompound(config, entityId, input.startupFolderId)
		if (!folder) return { ok: false, message: config.successMessages.notFound }

		const entityCompanyId = await fetchEntityCompany(config, entityId)
		const userInfo = await fetchUserCompany(input.userId)
		if (!userInfo || !entityCompanyId || userInfo.companyId !== entityCompanyId) {
			return { ok: false, message: config.successMessages.notAuthorized }
		}

		const db = await getDemoDb()
		const id = crypto.randomUUID()
		const ts = now()

		await db.query(
			`INSERT INTO "${config.documentTable}"
			 (id, type, name, url, "uploadedAt", category, status, "uploadedById", "folderId", "expirationDate")
			 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
			[
				id,
				input.documentType,
				input.documentName,
				input.url,
				ts,
				config.category,
				ReviewStatus.DRAFT,
				input.userId,
				folder.id,
				input.expirationDate.toISOString(),
			],
		)

		try {
			await logActivity({
				userId: input.userId,
				module: MODULES.STARTUP_FOLDERS,
				action: ACTIVITY_TYPE.UPLOAD,
				entityId: id,
				entityType: config.documentEntityType,
				metadata: {
					documentName: input.documentName,
					documentType: input.documentType,
					[config.entityField]: entityId,
					startupFolderId: input.startupFolderId,
					documentUrl: input.url,
					expirationDate: input.expirationDate.toISOString(),
				},
			})
		} catch {
			/* audit best-effort */
		}

		return { ok: true, message: config.successMessages.uploadOk }
	} catch (error) {
		console.error(`[${config.key}] createDocument`, error)
		return { ok: false, message: config.successMessages.uploadFail }
	}
}

/* ---------------- 2. getEntities ---------------- */

interface SelectedEntity {
	id: string
	rut: string
	name: string
	status: ReviewStatus
}

export async function getEntities(
	config: EntityFolderConfig,
	params: { companyId: string; startupFolderId: string },
): Promise<{ allEntities: SelectedEntity[]; vinculatedEntities: SelectedEntity[] }> {
	try {
		const db = await getDemoDb()
		const { companyId, startupFolderId } = params

		if (config.entityTable === "user") {
			const linkedRes = await db.query<{ id: string; rut: string; name: string; status: ReviewStatus }>(
				`SELECT u.id, u.rut, u.name, f.status
				 FROM "${config.folderTable}" f
				 JOIN "user" u ON u.id = f."workerId"
				 WHERE f."startupFolderId" = $1
				   AND u."companyId" = $2
				   AND u."isActive" = true
				   AND u."accessRole" = $3`,
				[startupFolderId, companyId, ACCESS_ROLE.PARTNER_COMPANY],
			)
			const linkedIds = linkedRes.rows.map((r) => r.id)
			const allRes = await db.query<{ id: string; rut: string; name: string }>(
				`SELECT id, rut, name FROM "user"
				 WHERE "companyId" = $1 AND "isActive" = true AND "accessRole" = $2
				   ${linkedIds.length > 0 ? `AND id <> ALL($3::text[])` : ""}
				 ORDER BY name ASC`,
				linkedIds.length > 0 ? [companyId, ACCESS_ROLE.PARTNER_COMPANY, linkedIds] : [companyId, ACCESS_ROLE.PARTNER_COMPANY],
			)
			return {
				vinculatedEntities: linkedRes.rows.map((r) => ({
					id: r.id,
					rut: r.rut,
					name: r.name,
					status: r.status,
				})),
				allEntities: allRes.rows.map((r) => ({
					id: r.id,
					rut: r.rut,
					name: r.name,
					status: ReviewStatus.DRAFT,
				})),
			}
		}

		// vehicle
		const linkedRes = await db.query<{
			id: string
			plate: string | null
			brand: string | null
			model: string | null
			status: ReviewStatus
		}>(
			`SELECT v.id, v.plate, v.brand, v.model, f.status
			 FROM "${config.folderTable}" f
			 JOIN "vehicle" v ON v.id = f."vehicleId"
			 WHERE f."startupFolderId" = $1 AND v."companyId" = $2 AND v."isActive" = true`,
			[startupFolderId, companyId],
		)
		const linkedIds = linkedRes.rows.map((r) => r.id)
		const allRes = await db.query<{
			id: string
			plate: string | null
			brand: string | null
			model: string | null
		}>(
			`SELECT id, plate, brand, model FROM "vehicle"
			 WHERE "companyId" = $1 AND "isActive" = true
			   ${linkedIds.length > 0 ? `AND id <> ALL($2::text[])` : ""}
			 ORDER BY plate ASC`,
			linkedIds.length > 0 ? [companyId, linkedIds] : [companyId],
		)
		const fmt = (v: { plate: string | null; brand: string | null; model: string | null }) =>
			`${v.plate ?? "Sin patente"} ${v.brand ?? ""} ${v.model ?? ""}`.trim()
		return {
			vinculatedEntities: linkedRes.rows.map((r) => ({
				id: r.id,
				rut: r.plate ?? "",
				name: fmt(r),
				status: r.status,
			})),
			allEntities: allRes.rows.map((r) => ({
				id: r.id,
				rut: r.plate ?? "",
				name: fmt(r),
				status: ReviewStatus.DRAFT,
			})),
		}
	} catch (error) {
		console.error(`[${config.key}] getEntities`, error)
		throw new Error("No se pudieron cargar las entidades")
	}
}

/* ---------------- 3. getFolderDocuments ---------------- */

export interface FolderDocumentsResult {
	totalDocuments: number
	approvedDocuments: number
	folderStatus: ReviewStatus
	documents: Array<{
		id: string
		url: string
		name: string
		type: string
		status: ReviewStatus
		folderId: string
		reviewerId: string | null
		reviewer: { id: string; name: string } | null
		uploadedAt: Date
		reviewedAt: Date | null
		reviewNotes: string | null
		submittedAt: Date | null
		uploadedById: string | null
		expirationDate: Date | null
		uploadedBy: {
			id: string
			rut: string
			name: string
			email: string
			phone: string | null
			image: string | null
		} | null
		category: DocumentCategory
	}>
}

export async function getFolderDocuments(
	config: FolderConfig,
	params: { startupFolderId: string; entityId?: string },
): Promise<FolderDocumentsResult> {
	const empty: FolderDocumentsResult = {
		documents: [],
		folderStatus: ReviewStatus.DRAFT,
		totalDocuments: 0,
		approvedDocuments: 0,
	}

	try {
		const folder = isEntityConfig(config)
			? params.entityId
				? await fetchFolderByCompound(config, params.entityId, params.startupFolderId)
				: null
			: await fetchFolderByStartup(config, params.startupFolderId)

		if (!folder) return empty

		const db = await getDemoDb()
		const docsRes = await db.query<{
			id: string
			url: string
			name: string
			type: string
			status: ReviewStatus
			folderId: string
			reviewerId: string | null
			uploadedAt: Date
			reviewedAt: Date | null
			reviewNotes: string | null
			submittedAt: Date | null
			uploadedById: string | null
			expirationDate: Date | null
			uploaded_name: string | null
			uploaded_rut: string | null
			uploaded_email: string | null
			uploaded_phone: string | null
			uploaded_image: string | null
			reviewer_name: string | null
		}>(
			`SELECT d.id, d.url, d.name, d.type, d.status, d."folderId", d."reviewerId",
			        d."uploadedAt", d."reviewedAt", d."reviewNotes", d."submittedAt",
			        d."uploadedById", d."expirationDate",
			        u.name AS uploaded_name, u.rut AS uploaded_rut, u.email AS uploaded_email,
			        u.phone AS uploaded_phone, u.image AS uploaded_image,
			        r.name AS reviewer_name
			 FROM "${config.documentTable}" d
			 LEFT JOIN "user" u ON u.id = d."uploadedById"
			 LEFT JOIN "user" r ON r.id = d."reviewerId"
			 WHERE d."folderId" = $1
			 ORDER BY d.name DESC`,
			[folder.id],
		)

		const documents = docsRes.rows.map((d) => ({
			id: d.id,
			url: d.url,
			name: d.name,
			type: d.type,
			status: d.status,
			folderId: d.folderId,
			reviewerId: d.reviewerId,
			reviewer: d.reviewerId ? { id: d.reviewerId, name: d.reviewer_name ?? "" } : null,
			uploadedAt: d.uploadedAt,
			reviewedAt: d.reviewedAt,
			reviewNotes: d.reviewNotes,
			submittedAt: d.submittedAt,
			uploadedById: d.uploadedById,
			expirationDate: d.expirationDate,
			uploadedBy: d.uploadedById
				? {
						id: d.uploadedById,
						name: d.uploaded_name ?? "",
						rut: d.uploaded_rut ?? "",
						email: d.uploaded_email ?? "",
						phone: d.uploaded_phone,
						image: d.uploaded_image,
					}
				: null,
			category: config.category,
		}))

		const expectedTypes =
			typeof config.expectedTypes === "function"
				? config.expectedTypes({ moreMonthDuration: false, isDriver: false })
				: config.expectedTypes

		const satisfied = new Set<string>()
		for (const doc of documents) {
			if (
				expectedTypes.includes(doc.type) &&
				(doc.status === ReviewStatus.APPROVED || doc.status === ReviewStatus.NOT_APPLIED)
			) {
				satisfied.add(doc.type)
			}
		}

		return {
			documents,
			folderStatus: folder.status,
			totalDocuments: expectedTypes.length,
			approvedDocuments: satisfied.size,
		}
	} catch (error) {
		console.error(`[${config.key}] getFolderDocuments`, error)
		throw new Error("Could not fetch folder documents")
	}
}

/* ---------------- 4. linkEntity ---------------- */

export interface LinkEntityInput {
	startupFolderId: string
	entityId: string
	userId: string
	isDriver?: boolean
}

export async function linkEntity(
	config: EntityFolderConfig,
	input: LinkEntityInput,
): Promise<ActionResult> {
	const db = await getDemoDb()
	const startup = await db.query<{ id: string }>(
		`SELECT id FROM "startup_folder" WHERE id = $1 LIMIT 1`,
		[input.startupFolderId],
	)
	if (startup.rows.length === 0) throw new Error("Carpeta de arranque no encontrada")

	const dup = await db.query<{ id: string }>(
		`SELECT id FROM "${config.folderTable}"
		 WHERE "${config.entityField}" = $1 AND "startupFolderId" = $2 LIMIT 1`,
		[input.entityId, input.startupFolderId],
	)
	if (dup.rows.length > 0) {
		throw new Error("Esta entidad ya está vinculada a la carpeta de arranque")
	}

	const id = crypto.randomUUID()
	const ts = now()
	const columns = [
		"id",
		config.entityField,
		`"startupFolderId"`,
		"status",
		`"createdAt"`,
		`"updatedAt"`,
	]
	const values: unknown[] = [id, input.entityId, input.startupFolderId, ReviewStatus.DRAFT, ts, ts]

	if (config.supportsIsDriver) {
		columns.push(`"isDriver"`)
		values.push(input.isDriver ?? true)
	}

	const placeholders = values.map((_, i) => `$${i + 1}`).join(", ")
	await db.query(
		`INSERT INTO "${config.folderTable}" (${columns
			.map((c) => (c.startsWith('"') ? c : `"${c}"`))
			.join(", ")}) VALUES (${placeholders})`,
		values,
	)

	if (config.syncIrlOnLink) {
		const sync = await syncIrlSafetyTalkCertificate(input.entityId)
		if (sync.processed && !sync.success) {
			console.error(`IRL sync failed for ${input.entityId}: ${sync.error}`)
		}
	}

	try {
		await logActivity({
			userId: input.userId,
			module: MODULES.STARTUP_FOLDERS,
			action: ACTIVITY_TYPE.CREATE,
			entityId: id,
			entityType: config.folderEntityType,
			metadata: {
				startupFolderId: input.startupFolderId,
				[config.entityField]: input.entityId,
				category: config.category,
				...(config.supportsIsDriver ? { isDriver: input.isDriver ?? true } : {}),
			},
		})
	} catch {
		/* audit best-effort */
	}

	return { ok: true, message: config.successMessages.linkOk }
}

/* ---------------- 5. submitForReview ---------------- */

export interface SubmitForReviewInput {
	emails: string[]
	userId: string
	folderId: string // startupFolderId
	workerId?: string
	vehicleId?: string
}

export async function submitForReview(
	config: FolderConfig,
	input: SubmitForReviewInput,
): Promise<ActionResult> {
	const user = await getSubmitRequester(input.userId)
	if (!user) return { ok: false, message: "Usuario no encontrado." }

	try {
		const folder = isEntityConfig(config)
			? await (async () => {
					const entityId = config.entityField === "workerId" ? input.workerId : input.vehicleId
					return entityId
						? await fetchFolderByCompound(config, entityId, input.folderId)
						: null
				})()
			: await fetchFolderByStartup(config, input.folderId)

		if (!folder) return { ok: false, message: "Carpeta no encontrada." }

		if (!isSubmittableFolderStatus(folder.status)) {
			return {
				ok: false,
				message: `La carpeta no se puede enviar a revisión porque su estado actual es '${folder.status}'.`,
			}
		}

		await submitFolderDocuments({
			folderTable: config.folderTable,
			documentTable: config.documentTable,
			folderId: folder.id,
			emails: input.emails,
			requesterEmail: user.email,
		})

		return { ok: true, message: config.successMessages.submitOk }
	} catch (error) {
		console.error(`[${config.key}] submitForReview`, error)
		return { ok: false, message: "Ocurrió un error en el servidor." }
	}
}

/* ---------------- 6. updateDocument ---------------- */

export interface UpdateDocumentInput {
	data: UpdateStartupFolderDocumentSchema
	uploadedFile: UploadResult
	userId: string
}

export async function updateDocument(
	config: FolderConfig,
	{ data, uploadedFile, userId }: UpdateDocumentInput,
): Promise<ActionResult<{ id: string }>> {
	try {
		const db = await getDemoDb()
		const existing = await db.query<{ folder_status: ReviewStatus }>(
			`SELECT f.status AS folder_status
			 FROM "${config.documentTable}" d
			 JOIN "${config.folderTable}" f ON f.id = d."folderId"
			 WHERE d.id = $1 LIMIT 1`,
			[data.documentId],
		)
		const found = existing.rows[0]
		if (!found) return { ok: false, message: "Documento no encontrado" }
		if (found.folder_status === ReviewStatus.APPROVED) {
			return {
				ok: false,
				message: "No puedes modificar documentos en esta carpeta porque ya fue aprobada",
			}
		}

		await db.query(
			`UPDATE "${config.documentTable}"
			 SET "expirationDate" = $1, status = $2, name = $3, url = $4,
			     "uploadedAt" = $5, type = $6, "uploadedById" = $7
			 WHERE id = $8`,
			[
				data.expirationDate,
				ReviewStatus.DRAFT,
				data.documentName,
				uploadedFile.url,
				now(),
				data.documentType,
				userId,
				data.documentId,
			],
		)

		return { ok: true, data: { id: data.documentId } }
	} catch (error) {
		console.error(`[${config.key}] updateDocument`, error)
		return { ok: false, message: "Error al procesar la solicitud" }
	}
}

/* ---------------- 7. updateDocumentExpirationDate ---------------- */

export async function updateDocumentExpirationDate(
	config: FolderConfig,
	{ data }: { data: UpdateExpirationDateSchema },
): Promise<ActionResult<{ id: string }>> {
	try {
		const db = await getDemoDb()
		const existing = await db.query<{ folder_status: ReviewStatus }>(
			`SELECT f.status AS folder_status
			 FROM "${config.documentTable}" d
			 JOIN "${config.folderTable}" f ON f.id = d."folderId"
			 WHERE d.id = $1 LIMIT 1`,
			[data.documentId],
		)
		const found = existing.rows[0]
		if (!found) return { ok: false, message: "Documento no encontrado" }
		if (found.folder_status !== ReviewStatus.DRAFT) {
			return {
				ok: false,
				message: "No puedes modificar documentos en esta carpeta porque ya fue aprobada",
			}
		}

		await db.query(
			`UPDATE "${config.documentTable}" SET "expirationDate" = $1 WHERE id = $2`,
			[data.expirationDate, data.documentId],
		)

		return { ok: true, data: { id: data.documentId } }
	} catch (error) {
		console.error(`[${config.key}] updateDocumentExpirationDate`, error)
		return { ok: false, message: "Error al procesar la solicitud" }
	}
}

/* ---------------- 8. undoDocumentReview (a.k.a. update-X-document-status) ---------------- */

export async function undoDocumentReview(
	config: FolderConfig,
	{ documentIds }: { documentIds: string[] },
): Promise<ActionResult> {
	try {
		const db = await getDemoDb()

		const placeholders = documentIds.map((_, i) => `$${i + 2}`).join(", ")
		const updateRes = await db.query(
			`UPDATE "${config.documentTable}"
			 SET status = $1, "reviewedAt" = NULL, "reviewerId" = NULL, "reviewNotes" = NULL
			 WHERE id IN (${placeholders})`,
			[ReviewStatus.SUBMITTED, ...documentIds],
		)

		if (updateRes.affectedRows === 0) {
			return { ok: false, message: "No se encontraron documentos" }
		}

		const docs = await db.query<{
			id: string
			folder_entity: string | null
			startupFolderId: string
		}>(
			`SELECT d.id,
			        ${isEntityConfig(config) ? `f."${config.entityField}"` : "NULL"} AS folder_entity,
			        f."startupFolderId" AS "startupFolderId"
			 FROM "${config.documentTable}" d
			 JOIN "${config.folderTable}" f ON f.id = d."folderId"
			 WHERE d.id IN (${placeholders})`,
			[ReviewStatus.SUBMITTED, ...documentIds],
		)

		const seen = new Set<string>()
		for (const doc of docs.rows) {
			const key = `${doc.folder_entity ?? ""}:${doc.startupFolderId}`
			if (seen.has(key)) continue
			seen.add(key)
			await recomputeSubfolderStatus({
				category: config.category,
				startupFolderId: doc.startupFolderId,
				workerId:
					isEntityConfig(config) && config.entityField === "workerId"
						? doc.folder_entity ?? undefined
						: undefined,
				vehicleId:
					isEntityConfig(config) && config.entityField === "vehicleId"
						? doc.folder_entity ?? undefined
						: undefined,
			})
		}

		return { ok: true, message: `${docs.rows.length} documento(s) actualizado(s) correctamente` }
	} catch (error) {
		console.error(`[${config.key}] undoDocumentReview`, error)
		return { ok: false, message: "Error al actualizar los documentos" }
	}
}

/* ---------------- 9. updateDocumentToUpdate ---------------- */

export async function updateDocumentToUpdate(
	config: FolderConfig,
	{ documentIds, startupFolderId }: { documentIds: string[]; startupFolderId: string },
): Promise<ActionResult> {
	try {
		const db = await getDemoDb()

		const startup = await db.query<{ companyId: string }>(
			`SELECT "companyId" FROM "startup_folder" WHERE id = $1 LIMIT 1`,
			[startupFolderId],
		)
		if (startup.rows.length === 0) {
			return { ok: false, message: "Carpeta de arranque no encontrada" }
		}

		const placeholders = documentIds.map((_, i) => `$${i + 3}`).join(", ")
		await db.query(
			`UPDATE "${config.documentTable}" d
			 SET status = $1, "reviewedAt" = $2
			 FROM "${config.folderTable}" f
			 WHERE d."folderId" = f.id
			   AND f."startupFolderId" = $${documentIds.length + 3}
			   AND d.id IN (${placeholders})`,
			[ReviewStatus.TO_UPDATE, now(), ...documentIds, startupFolderId],
		)

		const docs = await db.query<{ folder_entity: string | null }>(
			`SELECT ${isEntityConfig(config) ? `f."${config.entityField}"` : "NULL"} AS folder_entity
			 FROM "${config.documentTable}" d
			 JOIN "${config.folderTable}" f ON f.id = d."folderId"
			 WHERE d.id IN (${documentIds.map((_, i) => `$${i + 1}`).join(", ")})`,
			documentIds,
		)

		const entityIds = new Set(docs.rows.map((d) => d.folder_entity).filter(Boolean) as string[])
		if (entityIds.size === 0 && !isEntityConfig(config)) {
			await recomputeSubfolderStatus({ category: config.category, startupFolderId })
		} else {
			for (const entityId of entityIds) {
				await recomputeSubfolderStatus({
					category: config.category,
					startupFolderId,
					workerId:
						isEntityConfig(config) && config.entityField === "workerId" ? entityId : undefined,
					vehicleId:
						isEntityConfig(config) && config.entityField === "vehicleId" ? entityId : undefined,
				})
			}
		}

		return {
			ok: true,
			message: `${documentIds.length} documento(s) marcado(s) para actualizar exitosamente`,
		}
	} catch (error) {
		console.error(`[${config.key}] updateDocumentToUpdate`, error)
		return { ok: false, message: "Error interno del servidor" }
	}
}
