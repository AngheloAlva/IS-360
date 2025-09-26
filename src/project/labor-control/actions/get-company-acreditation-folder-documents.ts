"use server"

import prisma from "@/lib/prisma"

import type { LaborControlDocument } from "../types"
import type { LABOR_CONTROL_STATUS } from "@prisma/client"

export async function getCompanyAcreditacionFolderDocuments({
	folderId,
}: {
	folderId: string
}): Promise<{
	documents: LaborControlDocument[]
	folderStatus: LABOR_CONTROL_STATUS
}> {
	try {
		console.log(folderId)
		const folder = await prisma.laborControlFolder.findUnique({
			where: {
				id: folderId,
			},
			select: {
				status: true,
			},
		})

		if (!folder) {
			throw new Error("Folder not found")
		}

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
		return {
			documents,
			folderStatus: folder?.status,
		}
	} catch (error) {
		console.error("Error fetching startup folder documents:", error)
		throw new Error("Could not fetch startup folder documents")
	}
}
