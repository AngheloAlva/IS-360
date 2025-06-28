"use server"

import { headers } from "next/headers"

import { sendCompletedNotificationEmail } from "./emails/send-completed-notification-email"
import { ACTIVITY_TYPE, MODULES, StartupFolderStatus } from "@prisma/client"
import { logActivity } from "@/lib/activity/log"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

interface CompleteFolderParams {
	startupFolderId: string
}

export const completeFolder = async ({ startupFolderId }: CompleteFolderParams) => {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return { ok: false, message: "No autorizado - Sesión no encontrada" }
	}

	try {
		const startupFolder = await prisma.startupFolder.update({
			where: { id: startupFolderId },
			data: { status: StartupFolderStatus.COMPLETED },
			select: {
				id: true,
				name: true,
				company: {
					select: {
						name: true,
						users: {
							where: {
								isActive: true,
								isSupervisor: true,
							},
							select: {
								email: true,
							},
						},
					},
				},
			},
		})

		sendCompletedNotificationEmail({
			completeDate: new Date(),
			completedBy: {
				name: session.user.name,
				email: session.user.email,
				phone: session.user.phone || null,
			},
			folderName: startupFolder.name,
			companyName: startupFolder.company.name,
			emails: startupFolder.company.users.map((user) => user.email),
		})

		logActivity({
			userId: session.user.id,
			module: MODULES.STARTUP_FOLDERS,
			action: ACTIVITY_TYPE.COMPLETE,
			entityId: startupFolder.id,
			entityType: "StartupFolder",
			metadata: {
				name: startupFolder.name,
				companyName: startupFolder.company.name,
			},
		})

		if (!startupFolder) {
			return { ok: false, message: "Carpeta de arranque no encontrada" }
		}

		return { ok: true, message: "Carpeta de arranque completada correctamente" }
	} catch (error) {
		console.error("Error al completar la carpeta de arranque:", error)
		return { ok: false, message: "Error al completar la carpeta de arranque" }
	}
}
