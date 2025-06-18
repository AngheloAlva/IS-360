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
		const folder = await prisma.startupFolder.findUnique({
			where: {
				id: startupFolderId,
			},
		})

		if (!folder) {
			throw new Error("Carpeta de arranque no encontrada")
		}

		switch (category) {
			case "PERSONNEL":
				const newWorkerFolder = await prisma.workerFolder.create({
					data: {
						worker: {
							connect: {
								id: entityId,
							},
						},
					},
				})

				if (!newWorkerFolder) {
					throw new Error("Carpeta de usuario no creada")
				}

				console.log("newWorkerFolder", newWorkerFolder)

				return await prisma.startupFolder.update({
					where: {
						id: startupFolderId,
					},
					data: {
						workersFolders: {
							connect: {
								id: newWorkerFolder.id,
							},
						},
					},
					select: {
						workersFolders: true,
					},
				})
			case "VEHICLES":
				const newVehicleFolder = await prisma.vehicleFolder.create({
					data: {
						vehicle: {
							connect: {
								id: entityId,
							},
						},
					},
				})

				if (!newVehicleFolder) {
					throw new Error("Carpeta de vehículo no creada")
				}

				console.log("newVehicleFolder", newVehicleFolder)

				return await prisma.startupFolder.update({
					where: {
						id: startupFolderId,
					},
					data: {
						vehiclesFolders: {
							connect: {
								id: newVehicleFolder.id,
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
