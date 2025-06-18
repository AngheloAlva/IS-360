"use server"

import prisma from "@/lib/prisma"
import { DocumentCategory, ReviewStatus } from "@prisma/client"
import {
	StartupFolderDocument,
	WorkerStartupFolderDocument,
	VehicleStartupFolderDocument,
	SafetyAndHealthStartupFolderDocument,
	EnvironmentalStartupFolderDocument,
} from "../types"

export async function getStartupFolderDocuments({
	startupFolderId,
	category,
	workerId,
	vehicleId,
}: {
	startupFolderId?: string
	category: DocumentCategory
	workerId?: string
	vehicleId?: string
}): Promise<{
	documents: StartupFolderDocument[]
	folderStatus: ReviewStatus
	totalDocuments: number
	approvedDocuments: number
}> {
	try {
		let folderStatus: ReviewStatus = "DRAFT"

		const folder = await (async () => {
			switch (category) {
				case "PERSONNEL":
					return prisma.workerFolder.findFirst({
						where: workerId ? { workerId } : { startupFolderId },
						include: {
							_count: {
								select: {
									documents: true,
								},
							},
						},
					})
				case "VEHICLES":
					return prisma.vehicleFolder.findFirst({
						where: vehicleId ? { vehicleId } : { startupFolderId },
						include: {
							_count: {
								select: {
									documents: true,
								},
							},
						},
					})
				case "SAFETY_AND_HEALTH":
					return prisma.safetyAndHealthFolder.findFirst({
						where: { startupFolderId },
						include: {
							_count: {
								select: {
									documents: true,
								},
							},
						},
					})
				case "ENVIRONMENTAL":
					return prisma.environmentalFolder.findFirst({
						where: { startupFolderId },
						include: {
							_count: {
								select: {
									documents: true,
								},
							},
						},
					})
				default:
					throw new Error(`Invalid category: ${category}`)
			}
		})()

		if (!folder) {
			return { documents: [], folderStatus, totalDocuments: 0, approvedDocuments: 0 }
		}

		folderStatus = folder.status

		const rawDocuments = await (async () => {
			switch (category) {
				case "PERSONNEL":
					return prisma.workerDocument.findMany({
						where: { folderId: folder.id },
						include: {
							uploadedBy: {
								select: {
									id: true,
									name: true,
								},
							},
							reviewer: {
								select: {
									id: true,
									name: true,
								},
							},
						},
						orderBy: { uploadedAt: "desc" },
					})
				case "VEHICLES":
					return prisma.vehicleDocument.findMany({
						where: { folderId: folder.id },
						include: {
							uploadedBy: {
								select: {
									id: true,
									name: true,
								},
							},
							reviewer: {
								select: {
									id: true,
									name: true,
								},
							},
						},
						orderBy: { uploadedAt: "desc" },
					})
				case "SAFETY_AND_HEALTH":
					return prisma.safetyAndHealthDocument.findMany({
						where: { folderId: folder.id },
						include: {
							uploadedBy: {
								select: {
									id: true,
									name: true,
								},
							},
							reviewer: {
								select: {
									id: true,
									name: true,
								},
							},
						},
						orderBy: { uploadedAt: "desc" },
					})
				case "ENVIRONMENTAL":
					return prisma.environmentalDocument.findMany({
						where: { folderId: folder.id },
						include: {
							uploadedBy: {
								select: {
									id: true,
									name: true,
								},
							},
							reviewer: {
								select: {
									id: true,
									name: true,
								},
							},
						},
						orderBy: { uploadedAt: "desc" },
					})
				default:
					return []
			}
		})()

		const documents: StartupFolderDocument[] = rawDocuments.map((doc) => {
			const baseDoc = {
				id: doc.id,
				name: doc.name,
				url: doc.url,
				uploadedAt: doc.uploadedAt,
				status: doc.status,
				reviewNotes: doc.reviewNotes,
				reviewedAt: doc.reviewedAt,
				submittedAt: doc.submittedAt,
				expirationDate: doc.expirationDate,
				uploadedBy: doc.uploadedBy,
				uploadedById: doc.uploadedById,
				folderId: doc.folderId,
				reviewerId: doc.reviewerId,
				reviewer: doc.reviewer,
			}

			switch (category) {
				case "PERSONNEL":
					return {
						...baseDoc,
						category: "PERSONNEL",
						type: doc.type,
					} as WorkerStartupFolderDocument
				case "VEHICLES":
					return {
						...baseDoc,
						category: "VEHICLES",
						type: doc.type,
					} as VehicleStartupFolderDocument
				case "SAFETY_AND_HEALTH":
					return {
						...baseDoc,
						category: "SAFETY_AND_HEALTH",
						type: doc.type,
					} as SafetyAndHealthStartupFolderDocument
				case "ENVIRONMENTAL":
					return {
						...baseDoc,
						category: "ENVIRONMENTAL",
						type: doc.type,
					} as EnvironmentalStartupFolderDocument
				default:
					throw new Error(`Invalid category: ${category}`)
			}
		})

		const totalDocuments = folder._count.documents
		const approvedDocuments = documents.filter((doc) => doc.status === "APPROVED").length

		return { documents, folderStatus, totalDocuments, approvedDocuments }
	} catch (error) {
		console.error("Error fetching startup folder documents:", error)
		throw new Error("Could not fetch startup folder documents")
	}
}
