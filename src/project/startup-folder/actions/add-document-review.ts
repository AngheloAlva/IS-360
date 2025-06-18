"use server"

import { sendReviewNotificationEmail } from "./send-review-notification-email"
import { DocumentCategory, type Prisma, ReviewStatus } from "@prisma/client"
import prisma from "@/lib/prisma"

interface AddDocumentReviewProps {
	comments: string
	documentId: string
	reviewerId: string
	startupFolderId: string
	category: DocumentCategory
	status: "APPROVED" | "REJECTED"
}

export const addDocumentReview = async ({
	status,
	category,
	comments,
	documentId,
	reviewerId,
	startupFolderId,
}: AddDocumentReviewProps): Promise<{ ok: boolean; message: string }> => {
	try {
		const newStatus = status === "APPROVED" ? ReviewStatus.APPROVED : ReviewStatus.REJECTED

		let document: Document
		let allDocuments: AllDocuments | null
		const now: Date = new Date()

		switch (category) {
			case DocumentCategory.SAFETY_AND_HEALTH:
				document = await prisma.safetyAndHealthDocument.update({
					where: { id: documentId },
					data: {
						status: newStatus,
						reviewNotes: comments,
						reviewedAt: now,
						reviewer: {
							connect: {
								id: reviewerId,
							},
						},
					},
					include: {
						uploadedBy: true,
					},
				})

				allDocuments = await prisma.safetyAndHealthFolder.findUnique({
					where: {
						startupFolderId,
					},
					select: {
						documents: {
							select: {
								status: true,
							},
						},
						additionalNotificationEmails: true,
						startupFolder: {
							select: {
								company: {
									select: {
										name: true,
									},
								},
							},
						},
					},
				})

				if (allDocuments?.documents.every((d) => d.status === ReviewStatus.APPROVED)) {
					prisma.safetyAndHealthFolder.update({
						where: { startupFolderId },
						data: {
							status: ReviewStatus.APPROVED,
						},
					})

					sendReviewNotificationEmail({
						folderName: "Seguridad y Salud Ocupacional",
						companyName: allDocuments?.startupFolder.company.name,
						emails: allDocuments.additionalNotificationEmails,
					})

					return {
						ok: true,
						message: "Revisión procesada exitosamente",
					}
				}

				if (allDocuments?.documents.every((d) => d.status !== ReviewStatus.SUBMITTED)) {
					prisma.safetyAndHealthFolder.update({
						where: { startupFolderId },
						data: {
							status: ReviewStatus.DRAFT,
						},
					})

					sendReviewNotificationEmail({
						folderName: "Seguridad y Salud Ocupacional",
						companyName: allDocuments?.startupFolder.company.name,
						emails: allDocuments.additionalNotificationEmails,
					})
					return {
						ok: true,
						message: "Revisión procesada exitosamente",
					}
				}
				break
			case DocumentCategory.ENVIRONMENTAL:
				document = await prisma.environmentalDocument.update({
					where: { id: documentId },
					data: {
						status: newStatus,
						reviewNotes: comments,
						reviewedAt: now,
						reviewer: {
							connect: {
								id: reviewerId,
							},
						},
					},
					include: {
						uploadedBy: true,
					},
				})

				allDocuments = await prisma.environmentalFolder.findUnique({
					where: {
						startupFolderId,
					},
					select: {
						documents: {
							select: {
								status: true,
							},
						},
						additionalNotificationEmails: true,
						startupFolder: {
							select: {
								company: {
									select: {
										name: true,
									},
								},
							},
						},
					},
				})

				if (allDocuments?.documents.every((d) => d.status === ReviewStatus.APPROVED)) {
					prisma.environmentalFolder.update({
						where: { startupFolderId },
						data: {
							status: ReviewStatus.APPROVED,
						},
					})

					sendReviewNotificationEmail({
						folderName: "Medio Ambiente",
						companyName: allDocuments?.startupFolder.company.name,
						emails: allDocuments.additionalNotificationEmails,
					})
					return {
						ok: true,
						message: "Revisión procesada exitosamente",
					}
				}

				if (allDocuments?.documents.every((d) => d.status !== ReviewStatus.SUBMITTED)) {
					prisma.environmentalFolder.update({
						where: { startupFolderId },
						data: {
							status: ReviewStatus.DRAFT,
						},
					})

					sendReviewNotificationEmail({
						folderName: "Medio Ambiente",
						companyName: allDocuments?.startupFolder.company.name,
						emails: allDocuments.additionalNotificationEmails,
					})

					return {
						ok: true,
						message: "Revisión procesada exitosamente",
					}
				}

				break
			case DocumentCategory.PERSONNEL:
				document = await prisma.workerDocument.update({
					where: { id: documentId },
					data: {
						reviewNotes: comments,
						reviewedAt: now,
						status: newStatus,
					},
					select: {
						folder: {
							select: {
								workerId: true,
							},
						},
						uploadedBy: true,
					},
				})

				allDocuments = await prisma.workerFolder.findFirst({
					where: {
						workerId: document.folder.workerId,
						startupFolderId,
					},
					select: {
						documents: {
							select: {
								status: true,
							},
						},
						additionalNotificationEmails: true,
						startupFolder: {
							select: {
								company: {
									select: {
										name: true,
									},
								},
							},
						},
					},
				})

				if (allDocuments?.documents.every((d) => d.status === ReviewStatus.APPROVED)) {
					await prisma.workerFolder.update({
						where: {
							workerId_startupFolderId: { workerId: document.folder.workerId, startupFolderId },
						},
						data: {
							status: ReviewStatus.APPROVED,
						},
					})

					sendReviewNotificationEmail({
						folderName: "Documentación Personal",
						companyName: allDocuments?.startupFolder.company.name,
						emails: allDocuments.additionalNotificationEmails,
					})

					return {
						ok: true,
						message: "Revisión procesada exitosamente",
					}
				}

				if (allDocuments?.documents.every((d) => d.status !== ReviewStatus.SUBMITTED)) {
					prisma.workerFolder.update({
						where: {
							workerId_startupFolderId: { workerId: document.folder.workerId, startupFolderId },
						},
						data: {
							status: ReviewStatus.DRAFT,
						},
					})

					sendReviewNotificationEmail({
						folderName: "Documentación Personal",
						companyName: allDocuments?.startupFolder.company.name,
						emails: allDocuments.additionalNotificationEmails,
					})

					return {
						ok: true,
						message: "Revisión procesada exitosamente",
					}
				}
				break
			case DocumentCategory.VEHICLES:
				document = await prisma.vehicleDocument.update({
					where: { id: documentId },
					data: {
						reviewNotes: comments,
						reviewedAt: now,
						status: newStatus,
						reviewer: {
							connect: {
								id: reviewerId,
							},
						},
					},
					select: {
						folder: {
							select: {
								vehicleId: true,
							},
						},
						uploadedBy: true,
					},
				})

				allDocuments = await prisma.vehicleFolder.findFirst({
					where: {
						vehicleId: document.folder.vehicleId,
						startupFolderId,
					},
					select: {
						documents: {
							select: {
								status: true,
							},
						},
						additionalNotificationEmails: true,
						startupFolder: {
							select: {
								company: {
									select: {
										name: true,
									},
								},
							},
						},
					},
				})

				if (allDocuments?.documents.every((d) => d.status === ReviewStatus.APPROVED)) {
					await prisma.vehicleFolder.update({
						where: {
							vehicleId_startupFolderId: { vehicleId: document.folder.vehicleId, startupFolderId },
						},
						data: {
							status: ReviewStatus.APPROVED,
						},
					})

					sendReviewNotificationEmail({
						folderName: "Vehículos y Equipos",
						companyName: allDocuments?.startupFolder.company.name,
						emails: allDocuments.additionalNotificationEmails,
					})

					return {
						ok: true,
						message: "Revisión procesada exitosamente",
					}
				}

				if (allDocuments?.documents.every((d) => d.status !== ReviewStatus.SUBMITTED)) {
					prisma.vehicleFolder.update({
						where: {
							vehicleId_startupFolderId: { vehicleId: document.folder.vehicleId, startupFolderId },
						},
						data: {
							status: ReviewStatus.DRAFT,
						},
					})

					sendReviewNotificationEmail({
						folderName: "Vehículos y Equipos",
						companyName: allDocuments?.startupFolder.company.name,
						emails: allDocuments.additionalNotificationEmails,
					})

					return {
						ok: true,
						message: "Revisión procesada exitosamente",
					}
				}

				break
			default:
				throw new Error(`Categoría de documento no soportada: ${category}`)
		}

		return {
			ok: true,
			message: "Revisión procesada exitosamente",
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

type Document =
	| Prisma.SafetyAndHealthDocumentGetPayload<{ include: { uploadedBy: true } }>
	| Prisma.WorkerDocumentGetPayload<{ select: { folder: { select: { workerId: true } } } }>
	| Prisma.VehicleDocumentGetPayload<{ select: { folder: { select: { vehicleId: true } } } }>
	| Prisma.EnvironmentalDocumentGetPayload<{ include: { uploadedBy: true } }>

type AllDocuments =
	| Prisma.SafetyAndHealthFolderGetPayload<{
			select: {
				documents: { select: { status: true } }
				startupFolder: { select: { company: { select: { name: true } } } }
				additionalNotificationEmails: true
			}
	  }>
	| Prisma.WorkerFolderGetPayload<{
			select: {
				documents: { select: { status: true } }
				startupFolder: { select: { company: { select: { name: true } } } }
				additionalNotificationEmails: true
			}
	  }>
	| Prisma.VehicleFolderGetPayload<{
			select: {
				documents: { select: { status: true } }
				startupFolder: { select: { company: { select: { name: true } } } }
				additionalNotificationEmails: true
			}
	  }>
	| Prisma.EnvironmentalFolderGetPayload<{
			select: {
				documents: { select: { status: true } }
				startupFolder: { select: { company: { select: { name: true } } } }
				additionalNotificationEmails: true
			}
	  }>
