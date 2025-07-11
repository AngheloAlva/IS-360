"use server"

import { ReviewStatus } from "@prisma/client"
import prisma from "@/lib/prisma"

import type { VehicleStartupFolderDocument } from "../../types"

export async function getVehicleFolderDocuments({
	startupFolderId,
	vehicleId,
}: {
	startupFolderId: string
	vehicleId: string
}): Promise<{
	totalDocuments: number
	approvedDocuments: number
	folderStatus: ReviewStatus
	documents: VehicleStartupFolderDocument[]
}> {
	try {
		let folderStatus: ReviewStatus = "DRAFT"

		const folder = await prisma.vehicleFolder.findUnique({
			where: { vehicleId_startupFolderId: { vehicleId, startupFolderId } },
			include: {
				_count: {
					select: {
						documents: true,
					},
				},
			},
		})

		if (!folder) {
			return {
				documents: [],
				folderStatus,
				totalDocuments: 0,
				approvedDocuments: 0,
			}
		}

		folderStatus = folder.status

		const rawDocuments = await prisma.vehicleDocument.findMany({
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
			orderBy: { name: "desc" },
		})

		const documents: VehicleStartupFolderDocument[] = rawDocuments.map((doc) => {
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

			return {
				...baseDoc,
				type: doc.type,
				category: "VEHICLES",
			} as VehicleStartupFolderDocument
		})

		const totalDocuments = folder._count.documents
		const approvedDocuments = documents.filter((doc) => doc.status === "APPROVED").length

		return {
			documents,
			folderStatus,
			totalDocuments,
			approvedDocuments,
		}
	} catch (error) {
		console.error("Error fetching startup folder documents:", error)
		throw new Error("Could not fetch startup folder documents")
	}
}
