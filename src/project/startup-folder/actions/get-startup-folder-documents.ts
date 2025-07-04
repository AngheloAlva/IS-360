"use server"

import prisma from "@/lib/prisma"
import { DocumentCategory, ReviewStatus } from "@prisma/client"
import {
	StartupFolderDocument,
	BasicStartupFolderDocument,
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
	startupFolderId: string
	category: DocumentCategory
	workerId?: string
	vehicleId?: string
}): Promise<{
	documents: StartupFolderDocument[]
	folderStatus: ReviewStatus
	totalDocuments: number
	approvedDocuments: number
	isDriver: boolean
}> {
	try {
		let folderStatus: ReviewStatus = "DRAFT"

		const folder = await (async () => {
			switch (category) {
				case "PERSONNEL":
					if (workerId) {
						return prisma.workerFolder.findUnique({
							where: { workerId_startupFolderId: { workerId, startupFolderId } },
							include: {
								_count: {
									select: {
										documents: true,
									},
								},
							},
						})
					}

					return prisma.workerFolder.findFirst({
						where: { startupFolderId },
						include: {
							_count: {
								select: {
									documents: true,
								},
							},
						},
					})
				case "VEHICLES":
					if (vehicleId) {
						return prisma.vehicleFolder.findUnique({
							where: { vehicleId_startupFolderId: { vehicleId, startupFolderId } },
							include: {
								_count: {
									select: {
										documents: true,
									},
								},
							},
						})
					}

					return prisma.vehicleFolder.findFirst({
						where: { startupFolderId },
						include: {
							_count: {
								select: {
									documents: true,
								},
							},
						},
					})
				case "SAFETY_AND_HEALTH":
					return prisma.safetyAndHealthFolder.findUnique({
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
					return prisma.environmentalFolder.findUnique({
						where: { startupFolderId },
						include: {
							_count: {
								select: {
									documents: true,
								},
							},
						},
					})
				case "BASIC":
					if (!workerId) {
						return null
					}
					return prisma.basicFolder.findUnique({
						where: { workerId_startupFolderId: { workerId, startupFolderId } },
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
			return {
				documents: [],
				folderStatus,
				totalDocuments: 0,
				approvedDocuments: 0,
				isDriver: false,
			}
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
				case "BASIC":
					return prisma.basicDocument.findMany({
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
				url: doc.url,
				name: doc.name,
				status: doc.status,
				folderId: doc.folderId,
				reviewer: doc.reviewer,
				reviewerId: doc.reviewerId,
				uploadedAt: doc.uploadedAt,
				reviewedAt: doc.reviewedAt,
				uploadedBy: doc.uploadedBy,
				reviewNotes: doc.reviewNotes,
				submittedAt: doc.submittedAt,
				uploadedById: doc.uploadedById,
				expirationDate: doc.expirationDate,
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
				case "BASIC":
					return {
						...baseDoc,
						category: "BASIC",
						type: doc.type,
					} as BasicStartupFolderDocument
				default:
					throw new Error(`Invalid category: ${category}`)
			}
		})

		const totalDocuments = folder._count.documents
		const approvedDocuments = documents.filter((doc) => doc.status === "APPROVED").length

		return {
			documents,
			folderStatus,
			totalDocuments,
			approvedDocuments,
			isDriver: (folder as unknown as { isDriver: boolean })?.isDriver ?? false,
		}
	} catch (error) {
		console.error("Error fetching startup folder documents:", error)
		throw new Error("Could not fetch startup folder documents")
	}
}
