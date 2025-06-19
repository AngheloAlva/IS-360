"use server"

import { BASIC_FOLDER_STRUCTURE } from "@/lib/consts/basic-startup-folders-structure"
import { sendReviewNotificationEmail } from "./send-review-notification-email"
import { DocumentCategory, type Prisma, ReviewStatus } from "@prisma/client"
import prisma from "@/lib/prisma"
import {
	WORKER_STRUCTURE,
	VEHICLE_STRUCTURE,
	ENVIRONMENTAL_STRUCTURE,
	SAFETY_AND_HEALTH_STRUCTURE,
} from "@/lib/consts/startup-folders-structure"

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
		const newStatus =
			status === ReviewStatus.APPROVED ? ReviewStatus.APPROVED : ReviewStatus.REJECTED

		let document: Document
		let totalDocuments: number
		let allDocuments: AllDocuments | null
		let totalReviewedDocuments: number

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
						id: true,
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

				totalDocuments = SAFETY_AND_HEALTH_STRUCTURE.documents.length

				if (
					allDocuments?.documents.every((d) => d.status === ReviewStatus.APPROVED) &&
					allDocuments.documents.length === totalDocuments
				) {
					prisma.safetyAndHealthFolder.update({
						where: { startupFolderId },
						data: {
							status: ReviewStatus.APPROVED,
						},
					})

					if (allDocuments.startupFolder) {
						sendReviewNotificationEmail({
							folderName: "Seguridad y Salud Ocupacional",
							companyName: allDocuments?.startupFolder.company.name,
							emails: allDocuments.additionalNotificationEmails,
						})
					}

					return {
						ok: true,
						message: "Revisión procesada exitosamente ",
					}
				}

				totalReviewedDocuments =
					(allDocuments?.documents.filter((d) => d.status === ReviewStatus.APPROVED).length || 0) +
					(allDocuments?.documents.filter((d) => d.status === ReviewStatus.REJECTED).length || 0)

				if (
					totalReviewedDocuments < totalDocuments &&
					allDocuments?.documents.every((d) => d.status !== ReviewStatus.SUBMITTED)
				) {
					await prisma.safetyAndHealthFolder.update({
						where: { startupFolderId },
						data: {
							status: ReviewStatus.DRAFT,
						},
					})

					if (allDocuments.startupFolder) {
						sendReviewNotificationEmail({
							folderName: "Seguridad y Salud Ocupacional",
							companyName: allDocuments.startupFolder.company.name,
							emails: allDocuments.additionalNotificationEmails,
						})
					}

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
						id: true,
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

				totalDocuments = ENVIRONMENTAL_STRUCTURE.documents.length

				if (
					allDocuments?.documents.every((d) => d.status === ReviewStatus.APPROVED) &&
					allDocuments.documents.length === totalDocuments
				) {
					prisma.environmentalFolder.update({
						where: { startupFolderId },
						data: {
							status: ReviewStatus.APPROVED,
						},
					})

					if (allDocuments.startupFolder) {
						sendReviewNotificationEmail({
							folderName: "Medio Ambiente",
							companyName: allDocuments?.startupFolder.company.name,
							emails: allDocuments.additionalNotificationEmails,
						})
					}

					return {
						ok: true,
						message: "Revisión procesada exitosamente",
					}
				}

				totalReviewedDocuments =
					(allDocuments?.documents.filter((d) => d.status === ReviewStatus.APPROVED).length || 0) +
					(allDocuments?.documents.filter((d) => d.status === ReviewStatus.REJECTED).length || 0)

				if (
					totalReviewedDocuments < totalDocuments &&
					allDocuments?.documents.every((d) => d.status !== ReviewStatus.SUBMITTED)
				) {
					await prisma.environmentalFolder.update({
						where: { startupFolderId },
						data: {
							status: ReviewStatus.DRAFT,
						},
					})

					if (allDocuments.startupFolder) {
						sendReviewNotificationEmail({
							folderName: "Medio Ambiente",
							companyName: allDocuments?.startupFolder.company.name,
							emails: allDocuments.additionalNotificationEmails,
						})
					}

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
						reviewer: {
							connect: {
								id: reviewerId,
							},
						},
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
					},
					select: {
						id: true,
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

				totalDocuments = WORKER_STRUCTURE.documents.length

				if (
					allDocuments?.documents.every((d) => d.status === ReviewStatus.APPROVED) &&
					allDocuments.documents.length === totalDocuments
				) {
					await prisma.workerFolder.update({
						where: {
							id: allDocuments.id,
						},
						data: {
							status: ReviewStatus.APPROVED,
						},
					})

					if (allDocuments.startupFolder) {
						sendReviewNotificationEmail({
							folderName: "Documentación Personal",
							companyName: allDocuments?.startupFolder.company.name,
							emails: allDocuments.additionalNotificationEmails,
						})
					}

					return {
						ok: true,
						message: "Revisión procesada exitosamente",
					}
				}

				totalReviewedDocuments =
					(allDocuments?.documents.filter((d) => d.status === ReviewStatus.APPROVED).length || 0) +
					(allDocuments?.documents.filter((d) => d.status === ReviewStatus.REJECTED).length || 0)

				if (
					totalReviewedDocuments < totalDocuments &&
					allDocuments?.documents.every((d) => d.status !== ReviewStatus.SUBMITTED)
				) {
					await prisma.workerFolder.update({
						where: {
							id: allDocuments.id,
						},
						data: {
							status: ReviewStatus.DRAFT,
						},
					})

					if (allDocuments.startupFolder) {
						sendReviewNotificationEmail({
							folderName: "Documentación Personal",
							companyName: allDocuments?.startupFolder.company.name,
							emails: allDocuments.additionalNotificationEmails,
						})
					}

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
						id: true,
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

				totalDocuments = VEHICLE_STRUCTURE.documents.length

				if (
					allDocuments?.documents.every((d) => d.status === ReviewStatus.APPROVED) &&
					allDocuments.documents.length === totalDocuments
				) {
					await prisma.vehicleFolder.update({
						where: {
							id: allDocuments.id,
						},
						data: {
							status: ReviewStatus.APPROVED,
						},
					})

					if (allDocuments.startupFolder) {
						sendReviewNotificationEmail({
							folderName: "Vehículos y Equipos",
							companyName: allDocuments?.startupFolder.company.name,
							emails: allDocuments.additionalNotificationEmails,
						})
					}

					return {
						ok: true,
						message: "Revisión procesada exitosamente",
					}
				}

				totalReviewedDocuments =
					(allDocuments?.documents.filter((d) => d.status === ReviewStatus.APPROVED).length || 0) +
					(allDocuments?.documents.filter((d) => d.status === ReviewStatus.REJECTED).length || 0)

				if (
					totalReviewedDocuments < totalDocuments &&
					allDocuments?.documents.every((d) => d.status !== ReviewStatus.SUBMITTED)
				) {
					await prisma.vehicleFolder.update({
						where: {
							id: allDocuments.id,
						},
						data: {
							status: ReviewStatus.DRAFT,
						},
					})

					if (allDocuments.startupFolder) {
						sendReviewNotificationEmail({
							folderName: "Vehículos y Equipos",
							companyName: allDocuments?.startupFolder.company.name,
							emails: allDocuments.additionalNotificationEmails,
						})
					}

					return {
						ok: true,
						message: "Revisión procesada exitosamente",
					}
				}

				break
			case DocumentCategory.BASIC:
				document = await prisma.basicDocument.update({
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
					include: {
						uploadedBy: true,
					},
				})

				allDocuments = await prisma.basicFolder.findUnique({
					where: {
						startupFolderId,
					},
					select: {
						id: true,
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

				totalDocuments = BASIC_FOLDER_STRUCTURE.documents.length

				if (
					allDocuments?.documents.every((d) => d.status === ReviewStatus.APPROVED) &&
					allDocuments.documents.length === totalDocuments
				) {
					prisma.basicFolder.update({
						where: { startupFolderId },
						data: {
							status: ReviewStatus.APPROVED,
						},
					})

					if (allDocuments.startupFolder) {
						sendReviewNotificationEmail({
							folderName: "Seguridad y Salud Ocupacional",
							companyName: allDocuments?.startupFolder.company.name,
							emails: allDocuments.additionalNotificationEmails,
						})
					}

					return {
						ok: true,
						message: "Revisión procesada exitosamente ",
					}
				}

				totalReviewedDocuments =
					(allDocuments?.documents.filter((d) => d.status === ReviewStatus.APPROVED).length || 0) +
					(allDocuments?.documents.filter((d) => d.status === ReviewStatus.REJECTED).length || 0)

				if (
					totalReviewedDocuments < totalDocuments &&
					allDocuments?.documents.every((d) => d.status !== ReviewStatus.SUBMITTED)
				) {
					await prisma.basicFolder.update({
						where: { startupFolderId },
						data: {
							status: ReviewStatus.DRAFT,
						},
					})

					if (allDocuments.startupFolder) {
						sendReviewNotificationEmail({
							folderName: "Seguridad y Salud Ocupacional",
							companyName: allDocuments.startupFolder.company.name,
							emails: allDocuments.additionalNotificationEmails,
						})
					}

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
	| Prisma.BasicDocumentGetPayload<{ include: { uploadedBy: true } }>

type AllDocuments =
	| Prisma.SafetyAndHealthFolderGetPayload<{
			select: {
				id: true
				documents: { select: { status: true } }
				startupFolder: { select: { company: { select: { name: true } } } }
				additionalNotificationEmails: true
			}
	  }>
	| Prisma.WorkerFolderGetPayload<{
			select: {
				id: true
				documents: { select: { status: true } }
				startupFolder: { select: { company: { select: { name: true } } } }
				additionalNotificationEmails: true
			}
	  }>
	| Prisma.VehicleFolderGetPayload<{
			select: {
				id: true
				documents: { select: { status: true } }
				startupFolder: { select: { company: { select: { name: true } } } }
				additionalNotificationEmails: true
			}
	  }>
	| Prisma.EnvironmentalFolderGetPayload<{
			select: {
				id: true
				documents: { select: { status: true } }
				startupFolder: { select: { company: { select: { name: true } } } }
				additionalNotificationEmails: true
			}
	  }>
	| Prisma.BasicFolderGetPayload<{
			select: {
				id: true
				documents: { select: { status: true } }
				startupFolder: { select: { company: { select: { name: true } } } }
				additionalNotificationEmails: true
			}
	  }>
