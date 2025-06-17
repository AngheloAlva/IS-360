"use server"

import prisma from "@/lib/prisma"
import { DocumentCategory } from "@prisma/client"

interface LinkFolderEntityParams {
	startupFolderId: string
	entityId: string
	category: DocumentCategory
}

export async function linkFolderEntity({
	startupFolderId,
	entityId,
	category,
}: LinkFolderEntityParams) {
	try {
		console.log("Linking folder entity", {
			startupFolderId,
			entityId,
			category,
		})

		switch (category) {
			case "PERSONNEL":
				const folder = await prisma.startupFolder.findUnique({
					where: {
						id: startupFolderId,
					},
				})

				if (!folder) {
					throw new Error("Carpeta no encontrada")
				}

				const workerFolder = await prisma.workerFolder.findFirst({
					where: {
						workerId: entityId,
					},
				})

				if (!workerFolder) {
					throw new Error("Carpeta de trabajador no encontrada")
				}

				return await prisma.startupFolder.update({
					where: {
						id: startupFolderId,
					},
					data: {
						workerFolders: {
							connect: {
								id: workerFolder.id,
							},
						},
					},
					select: {
						workerFolders: true,
					},
				})
			case "VEHICLES":
				const vehicleFolder = await prisma.vehicleFolder.findFirst({
					where: {
						vehicleId: entityId,
					},
				})

				if (!vehicleFolder) {
					throw new Error("Carpeta de vehículo no encontrada")
				}

				return await prisma.startupFolder.update({
					where: {
						id: startupFolderId,
					},
					data: {
						vehicleFolders: {
							connect: {
								id: vehicleFolder.id,
							},
						},
					},
				})
			default:
				throw new Error(`Cannot link entity for category: ${category}`)
		}
	} catch (error) {
		if (error instanceof Error && error.message.includes("Unique constraint")) {
			throw new Error("Esta entidad ya está vinculada a la carpeta de arranque")
		}
		console.error("Error linking folder entity:", error)
		throw new Error("No se pudo vincular la entidad a la carpeta de arranque")
	}
}
