"use server"

import { ACTIVITY_TYPE, DocumentCategory, MODULES } from "@prisma/client"
import { logActivity } from "@/lib/activity/log"
import prisma from "@/lib/prisma"

interface LinkVehicleEntityParams {
	startupFolderId: string
	entityId: string
	userId: string
}

export async function linkVehicleEntity({
	startupFolderId,
	entityId,
	userId,
}: LinkVehicleEntityParams) {
	try {
		const folder = await prisma.startupFolder.findUnique({
			where: {
				id: startupFolderId,
			},
		})

		if (!folder) {
			throw new Error("Carpeta de arranque no encontrada")
		}

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
				category: DocumentCategory.VEHICLES,
			},
		})

		return {
			ok: true,
			message: "Carpeta del vehiculo creada y asignada",
		}
	} catch (error) {
		console.error("Error linking folder entity:", error)
		if (error instanceof Error && error.message.includes("Unique constraint")) {
			throw new Error("Esta entidad ya está vinculada a la carpeta de arranque")
		}
		throw new Error("No se pudo vincular la entidad a la carpeta de arranque")
	}
}
