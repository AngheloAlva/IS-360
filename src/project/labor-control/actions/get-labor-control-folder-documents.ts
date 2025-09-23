"use server"

import prisma from "@/lib/prisma"

import type { LaborControlDocument, WorkerLaborControlFolder } from "../types"

export async function getLaborControlFolderDocuments({ folderId }: { folderId: string }): Promise<{
	documents: LaborControlDocument[]
	workerFolders: WorkerLaborControlFolder[]
}> {
	try {
		const documents = await prisma.laborControlDocument.findMany({
			where: { folderId },
			select: {
				id: true,
				name: true,
				url: true,
				status: true,
				folderId: true,
				reviewById: true,
				reviewNotes: true,
				reviewDate: true,
				uploadDate: true,
				updatedAt: true,
				uploadById: true,
				type: true,
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
		})

		const workerFolders = await prisma.workerLaborControlFolder.findMany({
			where: { laborControlFolderId: folderId },
			select: {
				id: true,
				status: true,
				workerId: true,
				worker: {
					select: {
						id: true,
						rut: true,
						name: true,
					},
				},
			},
		})

		return {
			documents,
			workerFolders,
		}
	} catch (error) {
		console.error("Error fetching startup folder documents:", error)
		throw new Error("Could not fetch startup folder documents")
	}
}
