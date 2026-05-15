"use server"

import { DocumentCategory, ReviewStatus } from "@/generated/prisma/enums"
import prisma from "@/lib/prisma"
import {
	SAFETY_AND_HEALTH_STRUCTURE,
	ENVIRONMENTAL_STRUCTURE,
	ENVIRONMENT_STRUCTURE,
	EXTENDED_ENVIRONMENT_STRUCTURE,
	TECH_SPEC_STRUCTURE,
} from "@/lib/consts/startup-folders-structure"

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

		// Obtener los tipos esperados de la estructura canónica
		const getExpectedTypes = async (): Promise<string[]> => {
			switch (category) {
				case "SAFETY_AND_HEALTH":
					return SAFETY_AND_HEALTH_STRUCTURE.documents.map((d) => d.type)
				case "ENVIRONMENTAL":
					return ENVIRONMENTAL_STRUCTURE.documents.map((d) => d.type)
				case "ENVIRONMENT": {
					const startupFolder = await prisma.startupFolder.findUnique({
						where: { id: startupFolderId },
						select: { moreMonthDuration: true },
					})
					return (
						startupFolder?.moreMonthDuration
							? EXTENDED_ENVIRONMENT_STRUCTURE
							: ENVIRONMENT_STRUCTURE
					).documents.map((d) => d.type)
				}
				case "TECHNICAL_SPECS":
					return TECH_SPEC_STRUCTURE.documents.map((d) => d.type)
				default:
					return []
			}
		}

		const expectedTypes = await getExpectedTypes()

		// Contar tipos únicos que tienen al menos un documento aprobado/no aplica
		const satisfiedTypes = new Set<string>()
		for (const doc of documents) {
			if (
				expectedTypes.includes(doc.type) &&
				(doc.status === "APPROVED" || doc.status === "NOT_APPLIED")
			) {
				satisfiedTypes.add(doc.type)
			}
		}

		const totalDocuments = expectedTypes.length
		const approvedDocuments = satisfiedTypes.size

		return {
			documents,
			folderStatus,
			totalDocuments,
			approvedDocuments,
			isDriver: false,
		}
	} catch (error) {
		console.error("Error fetching startup folder documents:", error)
		throw new Error("Could not fetch startup folder documents")
	}
}
