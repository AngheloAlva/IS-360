"use server"

import { LABOR_CONTROL_STATUS } from "@prisma/client"
import prisma from "@/lib/prisma"

import type { WorkerLaborControlDocument } from "../../types"

export async function getWorkerFolderDocuments({ folderId }: { folderId: string }): Promise<{
	workerId: string
	totalDocuments: number
	approvedDocuments: number
	folderStatus: LABOR_CONTROL_STATUS
	documents: WorkerLaborControlDocument[]
}> {
	try {
		let folderStatus: LABOR_CONTROL_STATUS = "DRAFT"

		const folder = await prisma.workerLaborControlFolder.findUnique({
			where: { id: folderId },
			include: {
				_count: {
					select: {
						documents: true,
					},
				},
				worker: {
					select: {
						id: true,
					},
				},
			},
		})

		if (!folder) {
			return {
				workerId: "",
				folderStatus,
				documents: [],
				totalDocuments: 0,
				approvedDocuments: 0,
			}
		}

		folderStatus = folder.status

		const documents = await prisma.workerLaborControlDocument.findMany({
			where: { folderId: folder.id },
			include: {
				uploadBy: {
					select: {
						id: true,
						rut: true,
						name: true,
						email: true,
						phone: true,
						image: true,
					},
				},
				reviewBy: {
					select: {
						id: true,
						rut: true,
						name: true,
						email: true,
						phone: true,
						image: true,
					},
				},
			},
			orderBy: { name: "desc" },
		})

		const totalDocuments = folder._count.documents
		const approvedDocuments = documents.filter((doc) => doc.status === "APPROVED").length

		return {
			documents,
			folderStatus,
			totalDocuments,
			approvedDocuments,
			workerId: folder.worker.id,
		}
	} catch (error) {
		console.error("Error fetching basic folder documents:", error)
		throw new Error("Could not fetch basic folder documents")
	}
}
