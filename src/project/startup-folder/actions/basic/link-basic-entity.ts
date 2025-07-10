"use server"

import { ACTIVITY_TYPE, DocumentCategory, MODULES } from "@prisma/client"
import { logActivity } from "@/lib/activity/log"
import prisma from "@/lib/prisma"

interface LinkBasicEntityParams {
	startupFolderId: string
	entityId: string
	userId: string
}

export async function linkBasicEntity({
	startupFolderId,
	entityId,
	userId,
}: LinkBasicEntityParams) {
	try {
		const folder = await prisma.startupFolder.findUnique({
			where: {
				id: startupFolderId,
			},
		})

		if (!folder) {
			throw new Error("Carpeta de arranque no encontrada")
		}

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

		logActivity({
			userId,
			module: MODULES.STARTUP_FOLDERS,
			action: ACTIVITY_TYPE.CREATE,
			entityId: newWorkerBasicFolder.id,
			entityType: "BasicFolder",
			metadata: {
				startupFolderId,
				workerId: entityId,
				category: DocumentCategory.BASIC,
			},
		})

		return {
			ok: true,
			message: "Carpeta de documentos básicos creada y asignada",
		}
	} catch (error) {
		console.error("Error linking folder entity:", error)
		if (error instanceof Error && error.message.includes("Unique constraint")) {
			throw new Error("Esta entidad ya está vinculada a la carpeta de arranque")
		}
		throw new Error("No se pudo vincular la entidad a la carpeta de arranque")
	}
}
