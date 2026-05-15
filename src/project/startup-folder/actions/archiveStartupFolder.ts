"use server"

import { headers } from "next/headers"
import { z } from "zod"

import { ACTIVITY_TYPE, MODULES } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

const archiveStartupFolderSchema = z.object({
	startupFolderId: z.string().min(1),
	archive: z.boolean(),
})

interface ArchiveStartupFolderProps {
	startupFolderId: string
	archive: boolean
}

export const archiveStartupFolder = async ({
	startupFolderId,
	archive,
}: ArchiveStartupFolderProps) => {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return {
			ok: false,
			message: "No autorizado",
		}
	}

	const hasPermission = await auth.api.userHasPermission({
		body: {
			userId: session.user.id,
			permission: {
				startupFolder: ["update"],
			},
		},
	})

	if (!hasPermission.success) {
		return {
			ok: false,
			message: "No tienes permiso para archivar carpetas de arranque",
		}
	}

	try {
		const validatedData = archiveStartupFolderSchema.parse({
			startupFolderId,
			archive,
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
				isArchived: true,
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
				message: "No se puede archivar una carpeta eliminada",
			}
		}

		if (startupFolder.isArchived === validatedData.archive) {
			return {
				ok: false,
				message: validatedData.archive
					? "La carpeta ya está archivada"
					: "La carpeta no está archivada",
			}
		}

		const updatedFolder = await prisma.startupFolder.update({
			where: {
				id: startupFolder.id,
			},
			data: {
				isArchived: validatedData.archive,
				archivedAt: validatedData.archive ? new Date() : null,
			},
		})

  await logActivity({
			userId: session.user.id,
			module: MODULES.STARTUP_FOLDERS,
			action: validatedData.archive ? ACTIVITY_TYPE.UPDATE : ACTIVITY_TYPE.UPDATE,
			entityId: updatedFolder.id,
			entityType: "StartupFolder",
			metadata: {
				companyId: updatedFolder.companyId,
				name: startupFolder.name,
				type: updatedFolder.type,
				action: validatedData.archive ? "archived" : "unarchived",
			},
		})

		return {
			ok: true,
			message: validatedData.archive
				? "Carpeta de arranque archivada correctamente"
				: "Carpeta de arranque desarchivada correctamente",
			data: {
				folderId: updatedFolder.id,
				isArchived: updatedFolder.isArchived,
			},
		}
	} catch (error) {
		console.error("Error al archivar la carpeta de arranque:", error)
		return {
			ok: false,
			message: "Error al archivar la carpeta de arranque",
		}
	}
}
