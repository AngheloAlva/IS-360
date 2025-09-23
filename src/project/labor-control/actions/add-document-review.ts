"use server"

import { headers } from "next/headers"

import { LABOR_CONTROL_STRUCTURE } from "@/lib/consts/labor-control-folders-structure"
import { MODULES, ACTIVITY_TYPE, LABOR_CONTROL_STATUS } from "@prisma/client"
// import { sendReviewNotificationEmail } from "./emails/send-review-notification-email"
import { logActivity } from "@/lib/activity/log"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

interface AddDocumentReviewProps {
	comments: string
	folderId: string
	workerId?: string
	documentId: string
	reviewerId: string
	status: "APPROVED" | "REJECTED"
}

export const addDocumentReview = async ({
	status,
	comments,
	folderId,
	workerId,
	documentId,
	reviewerId,
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
		const newStatus =
			status === LABOR_CONTROL_STATUS.APPROVED
				? LABOR_CONTROL_STATUS.APPROVED
				: LABOR_CONTROL_STATUS.REJECTED

		logActivity({
			userId: reviewerId,
			entityId: documentId,
			module: MODULES.LABOR_CONTROL_FOLDERS,
			action:
				newStatus === LABOR_CONTROL_STATUS.APPROVED ? ACTIVITY_TYPE.APPROVE : ACTIVITY_TYPE.REJECT,
			entityType: "LaborControlDocument",
			metadata: {
				comments,
				folderId,
			},
		})

		if (!workerId) {
			const document = await prisma.laborControlDocument.update({
				where: { id: documentId },
				data: {
					reviewNotes: comments,
					reviewDate: new Date(),
					status: newStatus,
					reviewBy: {
						connect: {
							id: reviewerId,
						},
					},
				},
				select: {
					folder: {
						select: {
							id: true,
						},
					},
				},
			})

			const allDocuments = await prisma.laborControlDocument.findMany({
				where: {
					folderId: document.folder.id,
				},
				select: {
					name: true,
					status: true,
					reviewNotes: true,
				},
			})

			const totalDocuments = LABOR_CONTROL_STRUCTURE.length

			if (
				allDocuments.every((d) => d.status === LABOR_CONTROL_STATUS.APPROVED) &&
				allDocuments.length >= totalDocuments
			) {
				await prisma.laborControlFolder.update({
					where: {
						id: document.folder.id,
					},
					data: {
						status: LABOR_CONTROL_STATUS.APPROVED,
					},
				})

				// if (allDocuments.startupFolder) {
				// 	sendReviewNotificationEmail({
				// 		folderName:
				// 			allDocuments.startupFolder.name + " - " + (allDocuments as any)?.worker?.name || "",
				// 		companyName: allDocuments?.startupFolder.company.name,
				// 		reviewDate: new Date(),
				// 		reviewer: {
				// 			name: session.user.name,
				// 			email: session.user.email,
				// 			phone: session.user.phone || null,
				// 		},
				// 		isApproved: true,
				// 		emails: allDocuments.additionalNotificationEmails,
				// 	})
				// }

				return {
					ok: true,
					message: "Revisión procesada exitosamente ",
				}
			}

			if (
				(allDocuments.some((d) => d.status === LABOR_CONTROL_STATUS.REJECTED) ||
					(allDocuments.length || 0) < totalDocuments) &&
				allDocuments.every((d) => d.status !== LABOR_CONTROL_STATUS.SUBMITTED)
			) {
				await prisma.laborControlFolder.update({
					where: {
						id: document.folder.id,
					},
					data: {
						status: LABOR_CONTROL_STATUS.DRAFT,
					},
				})

				// if (allDocuments.startupFolder) {
				// 	sendReviewNotificationEmail({
				// 		folderName: "Documentos Básicos",
				// 		companyName: allDocuments.startupFolder.company.name,
				// 		reviewDate: new Date(),
				// 		reviewer: {
				// 			name: session.user.name,
				// 			email: session.user.email,
				// 			phone: session.user.phone || null,
				// 		},
				// 		isApproved: false,
				// 		rejectedDocuments: allDocuments.documents
				// 			.filter((d) => d.status === LABOR_CONTROL_STATUS.REJECTED)
				// 			.map((d) => ({
				// 				name: d.name,
				// 				reason: d.reviewNotes || "",
				// 			})),
				// 		emails: allDocuments.additionalNotificationEmails,
				// 	})
				// }

				return {
					ok: true,
					message: "Revisión procesada exitosamente",
				}
			}
		} else {
			const document = await prisma.workerLaborControlDocument.update({
				where: { id: documentId },
				data: {
					reviewNotes: comments,
					reviewDate: new Date(),
					status: newStatus,
					reviewBy: {
						connect: {
							id: reviewerId,
						},
					},
				},
				select: {
					folder: {
						select: {
							id: true,
						},
					},
				},
			})

			const allDocuments = await prisma.workerLaborControlDocument.findMany({
				where: {
					folderId: document.folder.id,
				},
				select: {
					name: true,
					status: true,
					reviewNotes: true,
				},
			})

			const totalDocuments = LABOR_CONTROL_STRUCTURE.length

			if (
				allDocuments.every((d) => d.status === LABOR_CONTROL_STATUS.APPROVED) &&
				allDocuments.length >= totalDocuments
			) {
				await prisma.workerLaborControlFolder.update({
					where: {
						id: document.folder.id,
					},
					data: {
						status: LABOR_CONTROL_STATUS.APPROVED,
					},
				})

				// if (allDocuments.startupFolder) {
				// 	sendReviewNotificationEmail({
				// 		folderName:
				// 			allDocuments.startupFolder.name + " - " + (allDocuments as any)?.worker?.name || "",
				// 		companyName: allDocuments?.startupFolder.company.name,
				// 		reviewDate: new Date(),
				// 		reviewer: {
				// 			name: session.user.name,
				// 			email: session.user.email,
				// 			phone: session.user.phone || null,
				// 		},
				// 		isApproved: true,
				// 		emails: allDocuments.additionalNotificationEmails,
				// 	})
				// }

				return {
					ok: true,
					message: "Revisión procesada exitosamente ",
				}
			}

			if (
				(allDocuments.some((d) => d.status === LABOR_CONTROL_STATUS.REJECTED) ||
					(allDocuments.length || 0) < totalDocuments) &&
				allDocuments.every((d) => d.status !== LABOR_CONTROL_STATUS.SUBMITTED)
			) {
				await prisma.workerLaborControlFolder.update({
					where: {
						id: document.folder.id,
					},
					data: {
						status: LABOR_CONTROL_STATUS.DRAFT,
					},
				})

				// if (allDocuments.startupFolder) {
				// 	sendReviewNotificationEmail({
				// 		folderName: "Documentos Básicos",
				// 		companyName: allDocuments.startupFolder.company.name,
				// 		reviewDate: new Date(),
				// 		reviewer: {
				// 			name: session.user.name,
				// 			email: session.user.email,
				// 			phone: session.user.phone || null,
				// 		},
				// 		isApproved: false,
				// 		rejectedDocuments: allDocuments.documents
				// 			.filter((d) => d.status === LABOR_CONTROL_STATUS.REJECTED)
				// 			.map((d) => ({
				// 				name: d.name,
				// 				reason: d.reviewNotes || "",
				// 			})),
				// 		emails: allDocuments.additionalNotificationEmails,
				// 	})
				// }

				return {
					ok: true,
					message: "Revisión procesada exitosamente",
				}
			}
		}

		return {
			ok: false,
			message: "Ocurrió un error inesperado al procesar la revisión",
		}
	} catch (error) {
		console.error("Error al procesar revisión de documento:", error)

		if (error instanceof Error) {
			return {
				ok: false,
				message: `Error al procesar la revisión: ${error.message}`,
			}
		}

		return {
			ok: false,
			message: "Ocurrió un error inesperado al procesar la revisión",
		}
	}
}
