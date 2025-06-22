"use server"

import { headers } from "next/headers"

import { ACTIVITY_TYPE, MODULES } from "@prisma/client"
import { logActivity } from "@/lib/activity/log"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

interface UpdateStartupFolderProps {
	name: string
	startupFolderId: string
}

export const updateStartupFolder = async ({ name, startupFolderId }: UpdateStartupFolderProps) => {
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
			message: "No tienes permiso para actualizar la carpeta de arranque",
		}
	}

	try {
		const startupFolder = await prisma.startupFolder.update({
			where: {
				id: startupFolderId,
			},
			data: {
				name,
			},
		})

		if (!startupFolder) {
			return {
				ok: false,
				message: "Error al actualizar la carpeta de arranque",
			}
		}

		logActivity({
			userId: session.user.id,
			module: MODULES.STARTUP_FOLDERS,
			action: ACTIVITY_TYPE.UPDATE,
			entityId: startupFolder.id,
			entityType: "StartupFolder",
			metadata: {
				name,
			},
		})

		return {
			ok: true,
			message: "Carpeta de arranque actualizada correctamente",
			data: {
				folderId: startupFolder.id,
			},
		}
	} catch (error) {
		console.error("Error al actualizar la carpeta de arranque:", error)
		return {
			ok: false,
			message: "Error al actualizar la carpeta de arranque",
		}
	}
}
