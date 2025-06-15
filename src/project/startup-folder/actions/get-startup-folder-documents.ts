"use server"

import prisma from "@/lib/prisma"
import { DocumentCategory } from "@prisma/client"

export async function getStartupFolderDocuments({
	startupFolderId,
	category,
	workerId,
	vehicleId,
}: {
	startupFolderId?: string
	category: DocumentCategory
	workerId?: string
	vehicleId?: string
}) {
	try {
		const folder = await (async () => {
			switch (category) {
				case "PERSONNEL":
					return prisma.workerFolder.findFirst({
						where: workerId ? { workerId } : { startupFolderId },
					})
				case "VEHICLES":
					return prisma.vehicleFolder.findFirst({
						where: vehicleId ? { vehicleId } : { startupFolderId },
					})
				case "SAFETY_AND_HEALTH":
					return prisma.safetyAndHealthFolder.findFirst({
						where: { startupFolderId },
					})
				case "ENVIRONMENTAL":
					return prisma.environmentalFolder.findFirst({
						where: { startupFolderId },
					})
				default:
					throw new Error(`Invalid category: ${category}`)
			}
		})()

		if (!folder) {
			return { documents: [] }
		}

		const documents = await (async () => {
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
						},
						orderBy: { uploadedAt: "desc" },
					})
				default:
					return []
			}
		})()

		return { documents }
	} catch (error) {
		console.error("Error fetching startup folder documents:", error)
		throw new Error("Could not fetch startup folder documents")
	}
}
