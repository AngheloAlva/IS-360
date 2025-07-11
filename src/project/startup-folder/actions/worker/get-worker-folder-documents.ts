"use server"

import { ReviewStatus } from "@prisma/client"
import prisma from "@/lib/prisma"

import type { WorkerStartupFolderDocument } from "../../types"

export async function getWorkerFolderDocuments({
	startupFolderId,
	workerId,
}: {
	startupFolderId: string
	workerId: string
}): Promise<{
	isDriver: boolean
	totalDocuments: number
	approvedDocuments: number
	folderStatus: ReviewStatus
	documents: WorkerStartupFolderDocument[]
}> {
	try {
		let folderStatus: ReviewStatus = "DRAFT"

		const folder = await prisma.workerFolder.findUnique({
			where: { workerId_startupFolderId: { workerId, startupFolderId } },
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
				isDriver: false,
				totalDocuments: 0,
				approvedDocuments: 0,
			}
		}

		folderStatus = folder.status

		const rawDocuments = await prisma.workerDocument.findMany({
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

		const documents: WorkerStartupFolderDocument[] = rawDocuments.map((doc) => {
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
				category: "PERSONNEL",
				type: doc.type,
			} as WorkerStartupFolderDocument
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
		console.error("Error fetching worker folder documents:", error)
		throw new Error("Could not fetch worker folder documents")
	}
}
