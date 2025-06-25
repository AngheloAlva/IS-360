"use server"

import { ACTIVITY_TYPE, DocumentCategory, MODULES } from "@prisma/client"
import { logActivity } from "@/lib/activity/log"
import prisma from "@/lib/prisma"

interface LinkFolderEntityParams {
	startupFolderId: string
	entityId: string
	category: DocumentCategory
	userId: string
}

export async function linkFolderEntity({
	startupFolderId,
	entityId,
	category,
	userId,
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
						startupFolder: {
							connect: {
								id: folder.id,
							},
						},
					},
				})

				if (!newWorkerFolder) {
					throw new Error("Carpeta de usuario no creada")
				}

				await logActivity({
					userId,
					module: MODULES.STARTUP_FOLDERS,
					action: ACTIVITY_TYPE.CREATE,
					entityId: newWorkerFolder.id,
					entityType: "WorkerFolder",
					metadata: {
						startupFolderId,
						workerId: entityId,
						category,
					},
				})

				return {
					ok: true,
					message: "Carpeta de colaborador creada y asignada",
				}
			case "VEHICLES":
				const newVehicleFolder = await prisma.vehicleFolder.create({
					data: {
						vehicle: {
							connect: {
								id: entityId,
							},
						},
						startupFolder: {
							connect: {
								id: folder.id,
							},
						},
					},
				})

				if (!newVehicleFolder) {
					throw new Error("Carpeta de vehículo no creada")
				}

				logActivity({
					userId,
					module: MODULES.STARTUP_FOLDERS,
					action: ACTIVITY_TYPE.CREATE,
					entityId: newVehicleFolder.id,
					entityType: "VehicleFolder",
					metadata: {
						startupFolderId,
						vehicleId: entityId,
						category,
					},
				})

				return {
					ok: true,
					message: "Carpeta del vehiculo creada y asignada",
				}
			case "BASIC":
				const newWorkerBasicFolder = await prisma.basicFolder.create({
					data: {
						worker: {
							connect: {
								id: entityId,
							},
						},
						startupFolder: {
							connect: {
								id: folder.id,
							},
						},
					},
				})

				if (!newWorkerBasicFolder) {
					throw new Error("Carpeta de usuario no creada")
				}

				await logActivity({
					userId,
					module: MODULES.STARTUP_FOLDERS,
					action: ACTIVITY_TYPE.CREATE,
					entityId: newWorkerBasicFolder.id,
					entityType: "BasicFolder",
					metadata: {
						startupFolderId,
						workerId: entityId,
						category,
					},
				})

				return {
					ok: true,
					message: "Carpeta de documentos básicos creada y asignada",
				}
			default:
				throw new Error(`Cannot link entity for category: ${category}`)
		}
	} catch (error) {
		console.error("Error linking folder entity:", error)
		if (error instanceof Error && error.message.includes("Unique constraint")) {
			throw new Error("Esta entidad ya está vinculada a la carpeta de arranque")
		}
		throw new Error("No se pudo vincular la entidad a la carpeta de arranque")
	}
}
