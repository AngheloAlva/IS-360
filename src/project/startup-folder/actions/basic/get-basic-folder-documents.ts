"use server"

import { ReviewStatus } from "@/generated/prisma/enums"
import prisma from "@/lib/prisma"
import { BASIC_FOLDER_STRUCTURE } from "@/lib/consts/basic-startup-folders-structure"

import type { BasicStartupFolderDocument } from "../../types"

export async function getBasicFolderDocuments({
	workerId,
	startupFolderId,
}: {
	workerId: string
	startupFolderId: string
}): Promise<{
	totalDocuments: number
	approvedDocuments: number
	folderStatus: ReviewStatus
	documents: BasicStartupFolderDocument[]
}> {
	try {
		let folderStatus: ReviewStatus = "DRAFT"

		const folder = await prisma.basicFolder.findUnique({
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
				totalDocuments: 0,
				approvedDocuments: 0,
			}
		}

		folderStatus = folder.status

		const rawDocuments = await prisma.basicDocument.findMany({
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

		const documents: BasicStartupFolderDocument[] = rawDocuments.map((doc) => {
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
				category: "BASIC",
				type: doc.type,
			} as BasicStartupFolderDocument
		})

		const expectedTypes = BASIC_FOLDER_STRUCTURE.documents.map((d) => d.type)

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
		}
	} catch (error) {
		console.error("Error fetching basic folder documents:", error)
		throw new Error("Could not fetch basic folder documents")
	}
}
