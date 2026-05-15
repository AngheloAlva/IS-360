"use server"

import { deleteStartupFolderSchema } from "../schemas/delete-startup-folder.schema"
import { ACTIVITY_TYPE, MODULES } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import prisma from "@/lib/prisma"

interface DeleteStartupFolderProps {
	startupFolderId: string
	userId: string
}

export const deleteStartupFolder = async ({
	startupFolderId,
	userId,
}: DeleteStartupFolderProps) => {
	try {
		const validatedData = deleteStartupFolderSchema.parse({
			startupFolderId,
		})

		const startupFolder = await prisma.startupFolder.findUnique({
			where: {
				id: validatedData.startupFolderId,
			},
			select: {
				id: true,
				name: true,
				type: true,
				companyId: true,
				isDeleted: true,
			},
		})

		if (!startupFolder) {
			return {
				ok: false,
				message: "Carpeta de arranque no encontrada",
			}
		}

		if (startupFolder.isDeleted) {
			return {
				ok: false,
				message: "La carpeta de arranque ya está eliminada",
			}
		}

		const deletedFolder = await prisma.startupFolder.update({
			where: {
				id: startupFolder.id,
			},
			data: {
				isDeleted: true,
				name: `Eliminado - ${startupFolder.name}`,
			},
		})

  await logActivity({
			userId,
			module: MODULES.STARTUP_FOLDERS,
			action: ACTIVITY_TYPE.DELETE,
			entityId: deletedFolder.id,
			entityType: "StartupFolder",
			metadata: {
				companyId: deletedFolder.companyId,
				originalName: startupFolder.name,
				newName: deletedFolder.name,
				type: deletedFolder.type,
			},
		})

		return {
			ok: true,
			message: "Carpeta de arranque eliminada correctamente",
			data: {
				folderId: startupFolder.id,
			},
		}
	} catch (error) {
		console.error("Error al eliminar la carpeta de arranque:", error)
		return {
			ok: false,
			message: "Error al eliminar la carpeta de arranque",
		}
	}
}
