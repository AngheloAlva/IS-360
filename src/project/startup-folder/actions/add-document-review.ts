"use server"

import { headers } from "next/headers"

import { ACTIVITY_TYPE, DocumentCategory, MODULES, ReviewStatus } from "@/generated/prisma/enums"
import { BASIC_FOLDER_STRUCTURE } from "@/lib/consts/basic-startup-folders-structure"
import {
	ENVIRONMENTAL_STRUCTURE,
	ENVIRONMENT_STRUCTURE,
	EXTENDED_ENVIRONMENT_STRUCTURE,
	SAFETY_AND_HEALTH_STRUCTURE,
	TECH_SPEC_STRUCTURE,
} from "@/lib/consts/startup-folders-structure"
import { VEHICLE_STRUCTURE } from "@/lib/consts/vehicle-folder-structure"
import {
	BASE_WORKER_STRUCTURE,
	DRIVER_WORKER_STRUCTURE,
} from "@/lib/consts/worker-folder-structure"
import { logActivity } from "@/lib/activity/log"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

import { recomputeSubfolderStatus } from "./recompute-subfolder-status"
import { sendReviewNotificationEmail } from "./emails/send-review-notification-email"

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

interface SnapshotDocument {
	name: string
	status: ReviewStatus
	reviewNotes: string | null
}

interface ReviewSnapshot {
	startupFolderName: string
	companyName: string
	documents: SnapshotDocument[]
	additionalNotificationEmails: string[]
	workerName?: string
	vehicle?: {
		plate: string | null
		brand: string | null
		model: string | null
	}
	moreMonthDuration?: boolean
	isDriver?: boolean
}

function toReviewStatus(status: AddDocumentReviewProps["status"]): ReviewStatus {
	if (status === "APPROVED") return ReviewStatus.APPROVED
	if (status === "NOT_APPLIED") return ReviewStatus.NOT_APPLIED
	return ReviewStatus.REJECTED
}

function getExpectedDocuments(category: DocumentCategory, snapshot: ReviewSnapshot): number {
	if (category === DocumentCategory.SAFETY_AND_HEALTH) {
		return SAFETY_AND_HEALTH_STRUCTURE.documents.length
	}

	if (category === DocumentCategory.ENVIRONMENTAL) {
		return ENVIRONMENTAL_STRUCTURE.documents.length
	}

	if (category === DocumentCategory.ENVIRONMENT) {
		return snapshot.moreMonthDuration
			? EXTENDED_ENVIRONMENT_STRUCTURE.documents.length
			: ENVIRONMENT_STRUCTURE.documents.length
	}

	if (category === DocumentCategory.TECHNICAL_SPECS) {
		return TECH_SPEC_STRUCTURE.documents.length
	}

	if (category === DocumentCategory.PERSONNEL) {
		return snapshot.isDriver
			? DRIVER_WORKER_STRUCTURE.documents.length
			: BASE_WORKER_STRUCTURE.documents.length
	}

	if (category === DocumentCategory.VEHICLES) {
		return VEHICLE_STRUCTURE.documents.length
	}

	return BASIC_FOLDER_STRUCTURE.documents.length
}

function getFolderName(category: DocumentCategory, snapshot: ReviewSnapshot): string {
	if (category === DocumentCategory.SAFETY_AND_HEALTH) {
		return `${snapshot.startupFolderName} - Seguridad y Salud Ocupacional`
	}

	if (category === DocumentCategory.ENVIRONMENTAL || category === DocumentCategory.ENVIRONMENT) {
		return `${snapshot.startupFolderName} - Medio Ambiente`
	}

	if (category === DocumentCategory.TECHNICAL_SPECS) {
		return `${snapshot.startupFolderName} - Especificaciones Tecnicas`
	}

	if (category === DocumentCategory.PERSONNEL || category === DocumentCategory.BASIC) {
		return `${snapshot.startupFolderName} - ${snapshot.workerName ?? "Trabajador"}`
	}

	const plate = snapshot.vehicle?.plate ?? "Sin patente"
	const brand = snapshot.vehicle?.brand ?? ""
	const model = snapshot.vehicle?.model ?? ""

	return `${snapshot.startupFolderName} - ${plate} ${brand} ${model}`.trim()
}

async function updateDocumentReviewByCategory(
	category: DocumentCategory,
	documentId: string,
	comments: string,
	reviewerId: string,
	newStatus: ReviewStatus,
	now: Date
): Promise<ReviewedDocumentRef> {
	if (category === DocumentCategory.SAFETY_AND_HEALTH) {
		await prisma.safetyAndHealthDocument.update({
			where: { id: documentId },
			data: {
				status: newStatus,
				reviewNotes: comments,
				reviewedAt: now,
				reviewer: { connect: { id: reviewerId } },
			},
		})
		return {}
	}

	if (category === DocumentCategory.ENVIRONMENTAL) {
		await prisma.environmentalDocument.update({
			where: { id: documentId },
			data: {
				status: newStatus,
				reviewNotes: comments,
				reviewedAt: now,
				reviewer: { connect: { id: reviewerId } },
			},
		})
		return {}
	}

	if (category === DocumentCategory.ENVIRONMENT) {
		await prisma.environmentDocument.update({
			where: { id: documentId },
			data: {
				status: newStatus,
				reviewNotes: comments,
				reviewedAt: now,
				reviewer: { connect: { id: reviewerId } },
			},
		})
		return {}
	}

	if (category === DocumentCategory.TECHNICAL_SPECS) {
		await prisma.techSpecsDocument.update({
			where: { id: documentId },
			data: {
				status: newStatus,
				reviewNotes: comments,
				reviewedAt: now,
				reviewer: { connect: { id: reviewerId } },
			},
		})
		return {}
	}

	if (category === DocumentCategory.PERSONNEL) {
		const document = await prisma.workerDocument.update({
			where: { id: documentId },
			data: {
				status: newStatus,
				reviewNotes: comments,
				reviewedAt: now,
				reviewer: { connect: { id: reviewerId } },
			},
			select: {
				folder: {
					select: {
						workerId: true,
						isDriver: true,
					},
				},
			},
		})

		return {
			workerId: document.folder.workerId,
			isDriver: document.folder.isDriver,
		}
	}

	if (category === DocumentCategory.VEHICLES) {
		const document = await prisma.vehicleDocument.update({
			where: { id: documentId },
			data: {
				status: newStatus,
				reviewNotes: comments,
				reviewedAt: now,
				reviewer: { connect: { id: reviewerId } },
			},
			select: {
				folder: {
					select: {
						vehicleId: true,
					},
				},
			},
		})

		return {
			vehicleId: document.folder.vehicleId,
		}
	}

	const document = await prisma.basicDocument.update({
		where: { id: documentId },
		data: {
			status: newStatus,
			reviewNotes: comments,
			reviewedAt: now,
			reviewer: { connect: { id: reviewerId } },
		},
		select: {
			folder: {
				select: {
					workerId: true,
				},
			},
		},
	})

	return {
		workerId: document.folder.workerId,
	}
}

async function getReviewSnapshot(
	category: DocumentCategory,
	startupFolderId: string,
	refs: ReviewedDocumentRef
): Promise<ReviewSnapshot> {
	if (category === DocumentCategory.SAFETY_AND_HEALTH) {
		const folder = await prisma.safetyAndHealthFolder.findUnique({
			where: { startupFolderId },
			select: {
				documents: { select: { name: true, status: true, reviewNotes: true } },
				additionalNotificationEmails: true,
				startupFolder: {
					select: {
						name: true,
						company: { select: { name: true } },
					},
				},
			},
		})

		if (!folder) throw new Error("No se encontro carpeta de seguridad y salud")

		return {
			startupFolderName: folder.startupFolder.name,
			companyName: folder.startupFolder.company.name,
			documents: folder.documents,
			additionalNotificationEmails: folder.additionalNotificationEmails,
		}
	}

	if (category === DocumentCategory.ENVIRONMENTAL) {
		const folder = await prisma.environmentalFolder.findUnique({
			where: { startupFolderId },
			select: {
				documents: { select: { name: true, status: true, reviewNotes: true } },
				additionalNotificationEmails: true,
				startupFolder: {
					select: {
						name: true,
						company: { select: { name: true } },
					},
				},
			},
		})

		if (!folder) throw new Error("No se encontro carpeta ambiental")

		return {
			startupFolderName: folder.startupFolder.name,
			companyName: folder.startupFolder.company.name,
			documents: folder.documents,
			additionalNotificationEmails: folder.additionalNotificationEmails,
		}
	}

	if (category === DocumentCategory.ENVIRONMENT) {
		const folder = await prisma.environmentFolder.findUnique({
			where: { startupFolderId },
			select: {
				documents: { select: { name: true, status: true, reviewNotes: true } },
				additionalNotificationEmails: true,
				startupFolder: {
					select: {
						name: true,
						moreMonthDuration: true,
						company: { select: { name: true } },
					},
				},
			},
		})

		if (!folder) throw new Error("No se encontro carpeta medio ambiente")

		return {
			startupFolderName: folder.startupFolder.name,
			companyName: folder.startupFolder.company.name,
			documents: folder.documents,
			additionalNotificationEmails: folder.additionalNotificationEmails,
			moreMonthDuration: folder.startupFolder.moreMonthDuration,
		}
	}

	if (category === DocumentCategory.TECHNICAL_SPECS) {
		const folder = await prisma.techSpecsFolder.findUnique({
			where: { startupFolderId },
			select: {
				documents: { select: { name: true, status: true, reviewNotes: true } },
				additionalNotificationEmails: true,
				startupFolder: {
					select: {
						name: true,
						company: { select: { name: true } },
					},
				},
			},
		})

		if (!folder) throw new Error("No se encontro carpeta de especificaciones tecnicas")

		return {
			startupFolderName: folder.startupFolder.name,
			companyName: folder.startupFolder.company.name,
			documents: folder.documents,
			additionalNotificationEmails: folder.additionalNotificationEmails,
		}
	}

	if (category === DocumentCategory.PERSONNEL) {
		if (!refs.workerId) throw new Error("No se encontro trabajador para carpeta personal")

		const folder = await prisma.workerFolder.findUnique({
			where: {
				workerId_startupFolderId: { workerId: refs.workerId, startupFolderId },
			},
			select: {
				documents: { select: { name: true, status: true, reviewNotes: true } },
				additionalNotificationEmails: true,
				isDriver: true,
				worker: {
					select: {
						name: true,
					},
				},
				startupFolder: {
					select: {
						name: true,
						company: { select: { name: true } },
					},
				},
			},
		})

		if (!folder) throw new Error("No se encontro carpeta de trabajador")

		return {
			startupFolderName: folder.startupFolder.name,
			companyName: folder.startupFolder.company.name,
			documents: folder.documents,
			additionalNotificationEmails: folder.additionalNotificationEmails,
			workerName: folder.worker.name,
			isDriver: folder.isDriver,
		}
	}

	if (category === DocumentCategory.VEHICLES) {
		if (!refs.vehicleId) throw new Error("No se encontro vehiculo para carpeta vehicular")

		const folder = await prisma.vehicleFolder.findUnique({
			where: {
				vehicleId_startupFolderId: { vehicleId: refs.vehicleId, startupFolderId },
			},
			select: {
				documents: { select: { name: true, status: true, reviewNotes: true } },
				additionalNotificationEmails: true,
				vehicle: {
					select: {
						plate: true,
						brand: true,
						model: true,
					},
				},
				startupFolder: {
					select: {
						name: true,
						company: { select: { name: true } },
					},
				},
			},
		})

		if (!folder) throw new Error("No se encontro carpeta de vehiculo")

		return {
			startupFolderName: folder.startupFolder.name,
			companyName: folder.startupFolder.company.name,
			documents: folder.documents,
			additionalNotificationEmails: folder.additionalNotificationEmails,
			vehicle: folder.vehicle,
		}
	}

	if (!refs.workerId) throw new Error("No se encontro trabajador para carpeta basica")

	const folder = await prisma.basicFolder.findUnique({
		where: {
			workerId_startupFolderId: { workerId: refs.workerId, startupFolderId },
		},
		select: {
			documents: { select: { name: true, status: true, reviewNotes: true } },
			additionalNotificationEmails: true,
			worker: {
				select: {
					name: true,
				},
			},
			startupFolder: {
				select: {
					name: true,
					company: { select: { name: true } },
				},
			},
		},
	})

	if (!folder) throw new Error("No se encontro carpeta basica")

	return {
		startupFolderName: folder.startupFolder.name,
		companyName: folder.startupFolder.company.name,
		documents: folder.documents,
		additionalNotificationEmails: folder.additionalNotificationEmails,
		workerName: folder.worker.name,
	}
}

export const addDocumentReview = async ({
	status,
	category,
	comments,
	documentId,
	startupFolderId,
}: AddDocumentReviewProps): Promise<{ ok: boolean; message: string }> => {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user) {
		return {
			ok: false,
			message: "No se encontro usuario",
		}
	}

	try {
		const reviewerId = session.user.id
		const now = new Date()
		const newStatus = toReviewStatus(status)

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
			metadata: {
				category,
				comments,
				startupFolderId,
			},
		})

		const refs = await updateDocumentReviewByCategory(
			category,
			documentId,
			comments,
			reviewerId,
			newStatus,
			now
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

		const snapshot = await getReviewSnapshot(category, startupFolderId, refs)
		const expectedDocuments = getExpectedDocuments(category, snapshot)

		const approvedOrNotApplied = snapshot.documents.filter(
			(document) =>
				document.status === ReviewStatus.APPROVED || document.status === ReviewStatus.NOT_APPLIED
		).length

		const rejectedDocuments = snapshot.documents
			.filter((document) => document.status === ReviewStatus.REJECTED)
			.map((document) => ({
				name: document.name,
				reason: document.reviewNotes ?? "",
			}))

		const hasSubmitted = snapshot.documents.some(
			(document) => document.status === ReviewStatus.SUBMITTED
		)

		if (recomputeResult.newStatus === ReviewStatus.APPROVED) {
			await sendReviewNotificationEmail({
				emails: snapshot.additionalNotificationEmails,
				folderName: getFolderName(category, snapshot),
				companyName: snapshot.companyName,
				reviewDate: now,
				reviewer: {
					name: session.user.name,
					email: session.user.email,
					phone: session.user.phone ?? null,
				},
				isApproved: true,
			})
		}

		if (
			recomputeResult.newStatus === ReviewStatus.DRAFT &&
			!hasSubmitted &&
			(rejectedDocuments.length > 0 || approvedOrNotApplied < expectedDocuments)
		) {
			await sendReviewNotificationEmail({
				emails: snapshot.additionalNotificationEmails,
				folderName: getFolderName(category, snapshot),
				companyName: snapshot.companyName,
				reviewDate: now,
				reviewer: {
					name: session.user.name,
					email: session.user.email,
					phone: session.user.phone ?? null,
				},
				isApproved: false,
				rejectedDocuments,
			})
		}

		return {
			ok: true,
			message: "Revision procesada exitosamente",
		}
	} catch (error) {
		console.error("Error al procesar revision de documento:", error)

		if (error instanceof Error) {
			return {
				ok: false,
				message: `Error al procesar la revision: ${error.message}`,
			}
		}

		return {
			ok: false,
			message: "Ocurrio un error inesperado al procesar la revision",
		}
	}
}
