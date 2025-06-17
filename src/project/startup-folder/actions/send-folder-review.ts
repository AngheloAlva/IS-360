"use server"

import { sendReviewNotificationEmail } from "./send-review-notification-email"
import { DocumentCategory, ReviewStatus } from "@prisma/client"
import prisma from "@/lib/prisma"

interface SendFolderReviewProps {
	userId: string
	folderId: string
	category: DocumentCategory
}

export const sendFolderReview = async ({ userId, folderId, category }: SendFolderReviewProps) => {
	try {
		let folder
		let companyName: string
		let additionalNotificationEmails: string[]

		switch (category) {
			case DocumentCategory.SAFETY_AND_HEALTH:
				folder = await prisma.safetyAndHealthFolder.update({
					where: { startupFolderId: folderId },
					data: {
						status: ReviewStatus.DRAFT,
						reviewer: {
							connect: {
								id: userId,
							},
						},
						submittedAt: new Date(),
					},
					select: {
						startupFolder: {
							select: {
								company: {
									select: {
										name: true,
									},
								},
							},
						},
						id: true,
						additionalNotificationEmails: true,
					},
				})
				companyName = folder.startupFolder.company.name
				additionalNotificationEmails = folder.additionalNotificationEmails
				const safetyAndHealthDocuments = await prisma.safetyAndHealthDocument.findMany({
					where: { folderId: folder.id },
				})
				safetyAndHealthDocuments.forEach(async (document) => {
					const newDocumentStatus =
						document.status === ReviewStatus.SUBMITTED
							? ReviewStatus.DRAFT
							: document.status === ReviewStatus.APPROVED
								? ReviewStatus.APPROVED
								: document.status === ReviewStatus.DRAFT
									? ReviewStatus.DRAFT
									: document.status

					await prisma.safetyAndHealthDocument.update({
						where: { id: document.id },
						data: {
							status: newDocumentStatus,
							submittedAt: new Date(),
						},
					})
				})
				break
			case DocumentCategory.ENVIRONMENTAL:
				folder = await prisma.environmentalFolder.update({
					where: { startupFolderId: folderId },
					data: {
						status: ReviewStatus.DRAFT,
						reviewer: {
							connect: {
								id: userId,
							},
						},
						submittedAt: new Date(),
					},
					select: {
						startupFolder: {
							select: {
								company: {
									select: {
										name: true,
									},
								},
							},
						},
						id: true,
						additionalNotificationEmails: true,
					},
				})

				if (!folder) {
					return {
						ok: false,
						message: "Carpeta no encontrada",
					}
				}

				companyName = folder.startupFolder.company.name
				additionalNotificationEmails = folder.additionalNotificationEmails
				const environmentalDocuments = await prisma.environmentalDocument.findMany({
					where: { folderId: folder.id },
				})
				environmentalDocuments.forEach(async (document) => {
					const newDocumentStatus =
						document.status === ReviewStatus.SUBMITTED
							? ReviewStatus.DRAFT
							: document.status === ReviewStatus.APPROVED
								? ReviewStatus.APPROVED
								: document.status === ReviewStatus.DRAFT
									? ReviewStatus.DRAFT
									: document.status

					await prisma.environmentalDocument.update({
						where: { id: document.id },
						data: {
							status: newDocumentStatus,
							submittedAt: new Date(),
						},
					})
				})
				companyName = folder.startupFolder.company.name
				break
			case DocumentCategory.PERSONNEL:
				folder = await prisma.workerFolder.findFirst({
					where: { startupFolderId: folderId },
					select: {
						startupFolder: {
							select: {
								company: {
									select: {
										name: true,
									},
								},
							},
						},
						id: true,
						additionalNotificationEmails: true,
					},
				})

				if (!folder) {
					return {
						ok: false,
						message: "Carpeta no encontrada",
					}
				}

				companyName = folder.startupFolder.company.name
				additionalNotificationEmails = folder.additionalNotificationEmails

				await prisma.workerFolder.update({
					where: { id: folder.id },
					data: {
						status: ReviewStatus.DRAFT,
						reviewerId: userId,
						submittedAt: new Date(),
					},
				})

				const workerDocuments = await prisma.workerDocument.findMany({
					where: { folderId: folder.id },
				})

				workerDocuments.forEach(async (document) => {
					const newDocumentStatus =
						document.status === ReviewStatus.SUBMITTED
							? ReviewStatus.DRAFT
							: document.status === ReviewStatus.APPROVED
								? ReviewStatus.APPROVED
								: document.status === ReviewStatus.DRAFT
									? ReviewStatus.DRAFT
									: document.status

					await prisma.workerDocument.update({
						where: { id: document.id },
						data: {
							status: newDocumentStatus,
							submittedAt: new Date(),
						},
					})
				})

				break
			case DocumentCategory.VEHICLES:
				folder = await prisma.vehicleFolder.findFirst({
					where: { startupFolderId: folderId },
					select: {
						startupFolder: {
							select: {
								company: {
									select: {
										name: true,
									},
								},
							},
						},
						id: true,
						additionalNotificationEmails: true,
					},
				})

				if (!folder) {
					return {
						ok: false,
						message: "Carpeta no encontrada",
					}
				}

				companyName = folder.startupFolder.company.name
				additionalNotificationEmails = folder.additionalNotificationEmails

				await prisma.vehicleFolder.update({
					where: { id: folder.id },
					data: {
						status: ReviewStatus.DRAFT,
						reviewerId: userId,
						submittedAt: new Date(),
					},
				})

				const vehicleDocuments = await prisma.vehicleDocument.findMany({
					where: { folderId: folder.id },
				})

				vehicleDocuments.forEach(async (document) => {
					const newDocumentStatus =
						document.status === ReviewStatus.SUBMITTED
							? ReviewStatus.DRAFT
							: document.status === ReviewStatus.APPROVED
								? ReviewStatus.APPROVED
								: document.status === ReviewStatus.DRAFT
									? ReviewStatus.DRAFT
									: document.status

					await prisma.vehicleDocument.update({
						where: { id: document.id },
						data: {
							status: newDocumentStatus,
							submittedAt: new Date(),
						},
					})
				})

				break
		}

		if (!folder) {
			return {
				ok: false,
				message: "Carpeta no encontrada",
			}
		}

		await sendReviewNotificationEmail({
			companyName,
			emails: additionalNotificationEmails,
			folderName: "Carpeta de Seguridad y Salud Ocupacional",
		})

		return {
			ok: true,
			message: "Revisión procesada exitosamente",
		}
	} catch (error) {
		console.log(error)
		return {
			ok: false,
			message: "Ocurrió un error al procesar la revisión",
		}
	}
}
