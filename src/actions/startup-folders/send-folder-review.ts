"use server"

import { DocumentCategory, ReviewStatus } from "@prisma/client"
import prisma from "@/lib/prisma"

interface SendFolderReviewProps {
	userId: string
	folderId: string
	isApproved: boolean
	category: DocumentCategory
}

export const sendFolderReview = async ({
	folderId,
	userId,
	category,
	isApproved,
}: SendFolderReviewProps) => {
	try {
		let folder
		const newStatus = isApproved ? ReviewStatus.APPROVED : ReviewStatus.DRAFT

		switch (category) {
			case DocumentCategory.SAFETY_AND_HEALTH:
				folder = await prisma.safetyAndHealthFolder.update({
					where: { id: folderId },
					data: {
						status: newStatus,
						reviewer: {
							connect: {
								id: userId,
							},
						},
						submittedAt: new Date(),
					},
				})
				await prisma.safetyAndHealthDocument.updateMany({
					where: { folderId: folderId },
					data: {
						status: newStatus,
						submittedAt: new Date(),
					},
				})
				break
			case DocumentCategory.ENVIRONMENTAL:
				folder = await prisma.environmentalFolder.update({
					where: { id: folderId },
					data: {
						status: newStatus,
						reviewer: {
							connect: {
								id: userId,
							},
						},
						submittedAt: new Date(),
					},
				})
				await prisma.environmentalDocument.updateMany({
					where: { folderId: folderId },
					data: {
						status: newStatus,
						submittedAt: new Date(),
					},
				})
				break
			case DocumentCategory.PERSONNEL:
				folder = await prisma.startupFolder.findFirst({
					where: { id: folderId },
				})
				if (!folder) {
					return {
						ok: false,
						message: "Carpeta no encontrada",
					}
				}

				const workerFolders = await prisma.workerFolder.findMany({
					where: { startupFolderId: folderId },
				})

				workerFolders.forEach(async (folder) => {
					await prisma.workerFolder.update({
						where: { id: folder.id },
						data: {
							status: newStatus,
							reviewerId: userId,
							submittedAt: new Date(),
						},
					})
					await prisma.workerDocument.updateMany({
						where: { folderId: folder.id },
						data: {
							status: newStatus,
							submittedAt: new Date(),
						},
					})
				})
				break
			case DocumentCategory.VEHICLES:
				folder = await prisma.startupFolder.findFirst({
					where: { id: folderId },
				})
				if (!folder) {
					return {
						ok: false,
						message: "Carpeta no encontrada",
					}
				}

				const vehicleFolders = await prisma.vehicleFolder.findMany({
					where: { startupFolderId: folderId },
				})

				vehicleFolders.forEach(async (folder) => {
					await prisma.vehicleFolder.update({
						where: { id: folder.id },
						data: {
							status: newStatus,
							reviewerId: userId,
							submittedAt: new Date(),
						},
					})
					await prisma.vehicleDocument.updateMany({
						where: { folderId: folder.id },
						data: {
							status: newStatus,
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

		// TODO: Add notification to folder.additionalNotificationEmails

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
