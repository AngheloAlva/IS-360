"use server"

import { ReviewStatus } from "@/generated/prisma/enums"
import prisma from "@/lib/prisma"
import {
	BASE_WORKER_STRUCTURE,
	DRIVER_WORKER_STRUCTURE,
} from "@/lib/consts/worker-folder-structure"

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

		const expectedTypes = (
			folder.isDriver ? DRIVER_WORKER_STRUCTURE : BASE_WORKER_STRUCTURE
		).documents.map((d) => d.type)

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
			isDriver: folder.isDriver ?? true,
		}
	} catch (error) {
		console.error("Error fetching worker folder documents:", error)
		throw new Error("Could not fetch worker folder documents")
	}
}
