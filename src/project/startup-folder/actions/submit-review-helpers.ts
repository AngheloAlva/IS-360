import { DocumentCategory, ReviewStatus } from "@/generated/prisma/enums"
import { generateSlug } from "@/lib/generateSlug"
import { getDemoDb } from "@/lib/demo-db/client"

const SUBMITTABLE_FOLDER_STATUSES: ReviewStatus[] = [
	ReviewStatus.DRAFT,
	ReviewStatus.REJECTED,
	ReviewStatus.EXPIRED,
]

export function isSubmittableFolderStatus(status: ReviewStatus): boolean {
	return SUBMITTABLE_FOLDER_STATUSES.includes(status)
}

export function getSubmittedDocumentStatus(status: ReviewStatus): ReviewStatus {
	if (status === ReviewStatus.APPROVED) return ReviewStatus.APPROVED
	if (status === ReviewStatus.NOT_APPLIED) return ReviewStatus.NOT_APPLIED
	if (status === ReviewStatus.TO_UPDATE) return ReviewStatus.TO_UPDATE
	if (status === ReviewStatus.REJECTED) return ReviewStatus.REJECTED
	return ReviewStatus.SUBMITTED
}

export function mergeNotificationEmails(emails: string[], requesterEmail: string): string[] {
	return [...new Set([...emails, requesterEmail])]
}

export function buildStartupFolderAdminReviewUrl(
	companyName: string,
	companyId: string,
	folderId: string,
): string {
	return `${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/admin/dashboard/carpetas-de-arranque/${generateSlug(companyName)}_${companyId}/${folderId}`
}

interface ReviewVehicleInfo {
	plate: string | null
	brand: string | null
	model: string | null
}

interface BuildFolderDisplayNameInput {
	category: DocumentCategory
	startupFolderName: string
	workerName?: string
	vehicle?: ReviewVehicleInfo
}

export function buildFolderDisplayName({
	category,
	startupFolderName,
	workerName,
	vehicle,
}: BuildFolderDisplayNameInput): string {
	if (category === DocumentCategory.SAFETY_AND_HEALTH) {
		return `${startupFolderName} - Seguridad y Salud Ocupacional`
	}
	if (category === DocumentCategory.ENVIRONMENT || category === DocumentCategory.ENVIRONMENTAL) {
		return `${startupFolderName} - Medio Ambiente`
	}
	if (category === DocumentCategory.TECHNICAL_SPECS) {
		return `${startupFolderName} - Especificaciones Tecnicas`
	}
	if (category === DocumentCategory.PERSONNEL || category === DocumentCategory.BASIC) {
		return `${startupFolderName} - ${workerName ?? "Trabajador"}`
	}

	const plate = vehicle?.plate ?? "Sin patente"
	const brand = vehicle?.brand ?? ""
	const model = vehicle?.model ?? ""

	return `${startupFolderName} - ${plate} ${brand} ${model}`.trim()
}

interface RequestSolicitator {
	rut: string
	name: string
	email: string
	phone: string | null
}

interface BuildRequestReviewEmailInput {
	category: DocumentCategory
	companyName: string
	reviewUrl: string
	solicitator: RequestSolicitator
	startupFolderName: string
	workerName?: string
	vehicle?: ReviewVehicleInfo
}

export function buildRequestReviewEmailPayload({
	category,
	companyName,
	reviewUrl,
	solicitator,
	startupFolderName,
	workerName,
	vehicle,
}: BuildRequestReviewEmailInput) {
	return {
		solicitator,
		reviewUrl,
		companyName,
		documentCategory: category,
		solicitationDate: new Date(),
		folderName: buildFolderDisplayName({
			category,
			workerName,
			vehicle,
			startupFolderName,
		}),
	}
}

interface SubmitRequester {
	rut: string
	name: string
	email: string
	phone: string | null
}

export async function getSubmitRequester(userId: string): Promise<SubmitRequester | null> {
	const db = await getDemoDb()
	const res = await db.query<SubmitRequester>(
		`SELECT rut, name, email, phone FROM "user" WHERE id = $1 LIMIT 1`,
		[userId],
	)
	return res.rows[0] ?? null
}

interface SubmitFolderDocumentsParams {
	folderTable: string
	documentTable: string
	folderId: string
	emails: string[]
	requesterEmail: string
}

export async function submitFolderDocuments({
	folderTable,
	documentTable,
	folderId,
	emails,
	requesterEmail,
}: SubmitFolderDocumentsParams): Promise<void> {
	const db = await getDemoDb()
	const submittedAt = new Date().toISOString()
	const mergedEmails = mergeNotificationEmails(emails, requesterEmail)

	await db.query(
		`UPDATE "${folderTable}"
		 SET status = $1, "submittedAt" = $2, "additionalNotificationEmails" = $3, "updatedAt" = $2
		 WHERE id = $4`,
		[ReviewStatus.SUBMITTED, submittedAt, mergedEmails, folderId],
	)

	const docs = await db.query<{ id: string; status: ReviewStatus }>(
		`SELECT id, status FROM "${documentTable}" WHERE "folderId" = $1`,
		[folderId],
	)

	for (const doc of docs.rows) {
		const nextStatus = getSubmittedDocumentStatus(doc.status)
		await db.query(`UPDATE "${documentTable}" SET status = $1, "submittedAt" = $2 WHERE id = $3`, [
			nextStatus,
			submittedAt,
			doc.id,
		])
	}
}
