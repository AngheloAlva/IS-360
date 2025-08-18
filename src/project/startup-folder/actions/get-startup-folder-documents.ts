"use server"

import { DocumentCategory, ReviewStatus } from "@prisma/client"
import prisma from "@/lib/prisma"

import type {
	StartupFolderDocument,
	TechSpecsStartupFolderDocument,
	EnvironmentStartupFolderDocument,
	EnvironmentalStartupFolderDocument,
	SafetyAndHealthStartupFolderDocument,
} from "../types"

export async function getStartupFolderDocuments({
	startupFolderId,
	category,
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
				case "ENVIRONMENT":
					return prisma.environmentFolder.findUnique({
						where: { startupFolderId },
						include: {
							_count: {
								select: {
									documents: true,
								},
							},
						},
					})
				case "TECHNICAL_SPECS":
					return prisma.techSpecsFolder.findUnique({
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
				case "SAFETY_AND_HEALTH":
					return prisma.safetyAndHealthDocument.findMany({
						where: { folderId: folder.id },
						include: {
							uploadedBy: {
								select: {
									id: true,
									rut: true,
									name: true,
									email: true,
									phone: true,
									image: true,
								},
							},
							reviewer: {
								select: {
									id: true,
									name: true,
								},
							},
						},
						orderBy: { name: "desc" },
					})
				case "ENVIRONMENTAL":
					return prisma.environmentalDocument.findMany({
						where: { folderId: folder.id },
						include: {
							uploadedBy: {
								select: {
									id: true,
									rut: true,
									name: true,
									email: true,
									phone: true,
									image: true,
								},
							},
							reviewer: {
								select: {
									id: true,
									name: true,
								},
							},
						},
						orderBy: { name: "desc" },
					})
				case "ENVIRONMENT":
					return prisma.environmentDocument.findMany({
						where: { folderId: folder.id },
						include: {
							uploadedBy: {
								select: {
									id: true,
									rut: true,
									name: true,
									email: true,
									phone: true,
									image: true,
								},
							},
							reviewer: {
								select: {
									id: true,
									name: true,
								},
							},
						},
						orderBy: { name: "desc" },
					})
				case "TECHNICAL_SPECS":
					return prisma.techSpecsDocument.findMany({
						where: { folderId: folder.id },
						include: {
							uploadedBy: {
								select: {
									id: true,
									rut: true,
									name: true,
									email: true,
									phone: true,
									image: true,
								},
							},
							reviewer: {
								select: {
									id: true,
									name: true,
								},
							},
						},
						orderBy: { name: "desc" },
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
				case "ENVIRONMENT":
					return {
						...baseDoc,
						category: "ENVIRONMENT",
						type: doc.type,
					} as EnvironmentStartupFolderDocument
				case "TECHNICAL_SPECS":
					return {
						...baseDoc,
						category: "TECHNICAL_SPECS",
						type: doc.type,
					} as TechSpecsStartupFolderDocument
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
