"use server"

import { ACTIVITY_TYPE, DocumentCategory, MODULES } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import prisma from "@/lib/prisma"
import { syncIrlSafetyTalkCertificate } from "@/project/startup-folder/actions/sync-irl-safety-talk-certificate"

interface LinkWorkerEntityParams {
	startupFolderId: string
	entityId: string
	isDriver: boolean
	userId: string
}

export async function linkWorkerEntity({
	userId,
	entityId,
	isDriver,
	startupFolderId,
}: LinkWorkerEntityParams) {
	try {
		const folder = await prisma.startupFolder.findUnique({
			where: {
				id: startupFolderId,
			},
		})

		if (!folder) {
			throw new Error("Carpeta de arranque no encontrada")
		}

		const newWorkerFolder = await prisma.workerFolder.create({
			data: {
				isDriver,
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

		const certificateSyncResult = await syncIrlSafetyTalkCertificate(entityId)
		if (certificateSyncResult.processed && !certificateSyncResult.success) {
			console.error(
				`Failed to sync IRL safety talk certificate for worker ${entityId}: ${certificateSyncResult.error}`
			)
		}

  await logActivity({
			userId,
			module: MODULES.STARTUP_FOLDERS,
			action: ACTIVITY_TYPE.CREATE,
			entityId: newWorkerFolder.id,
			entityType: "WorkerFolder",
			metadata: {
				isDriver,
				startupFolderId,
				workerId: entityId,
				category: DocumentCategory.PERSONNEL,
			},
		})

		return {
			ok: true,
			message: "Carpeta de colaborador creada y asignada",
		}
	} catch (error) {
		console.error("Error linking folder entity:", error)
		if (error instanceof Error && error.message.includes("Unique constraint")) {
			throw new Error("Esta entidad ya está vinculada a la carpeta de arranque")
		}
		throw new Error("No se pudo vincular la entidad a la carpeta de arranque")
	}
}
