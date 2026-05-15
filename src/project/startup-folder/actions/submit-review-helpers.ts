import { DocumentCategory, ReviewStatus } from "@/generated/prisma/enums"
import type { Prisma } from "@/generated/prisma/client"
import { generateSlug } from "@/lib/generateSlug"
import prisma from "@/lib/prisma"

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
	folderId: string
): string {
	return `${process.env.NEXT_PUBLIC_BASE_URL}/admin/dashboard/carpetas-de-arranque/${generateSlug(companyName)}_${companyId}/${folderId}`
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
	return prisma.user.findUnique({
		where: { id: userId },
		select: {
			rut: true,
			name: true,
			email: true,
			phone: true,
		},
	})
}

interface SubmitFolderDocumentsParams {
	updateFolder: (tx: Prisma.TransactionClient, submittedAt: Date) => Promise<unknown>
	getDocuments: (
		tx: Prisma.TransactionClient
	) => Promise<Array<{ id: string; status: ReviewStatus }>>
	updateDocument: (
		tx: Prisma.TransactionClient,
		documentId: string,
		status: ReviewStatus,
		submittedAt: Date
	) => Promise<unknown>
}

export async function submitFolderDocuments({
	updateFolder,
	getDocuments,
	updateDocument,
}: SubmitFolderDocumentsParams): Promise<void> {
	await prisma.$transaction(async (tx) => {
		const submittedAt = new Date()

		await updateFolder(tx, submittedAt)

		const documents = await getDocuments(tx)

		await Promise.all(
			documents.map((document) =>
				updateDocument(tx, document.id, getSubmittedDocumentStatus(document.status), submittedAt)
			)
		)
	})
}
