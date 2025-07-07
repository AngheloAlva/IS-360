"use server"

import { headers } from "next/headers"

import { ACTIVITY_TYPE, MODULES, StartupFolderType } from "@prisma/client"
import { logActivity } from "@/lib/activity/log"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

interface CreateStartupFolderProps {
	name: string
	companyId: string
	type: StartupFolderType
	moreMonthDuration: boolean
}

export const createStartupFolder = async ({
	name,
	companyId,
	type,
	moreMonthDuration,
}: CreateStartupFolderProps) => {
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
				startupFolder: ["create"],
			},
		},
	})

	if (!hasPermission.success) {
		return {
			ok: false,
			message: "No tienes permiso para crear carpetas de arranque",
		}
	}

	try {
		const startupFolder = await prisma.startupFolder.create({
			data: {
				name,
				type,
				companyId,
				moreMonthDuration,
			},
		})

		if (type === StartupFolderType.FULL) {
			const safetyAndHealthFolder = await prisma.safetyAndHealthFolder.create({
				data: {
					startupFolder: {
						connect: {
							id: startupFolder.id,
						},
					},
				},
			})

			const environmentFolder = await prisma.environmentFolder.create({
				data: {
					startupFolder: {
						connect: {
							id: startupFolder.id,
						},
					},
				},
			})

			const techSpecsFolder = await prisma.techSpecsFolder.create({
				data: {
					startupFolder: {
						connect: {
							id: startupFolder.id,
						},
					},
				},
			})

			if (!startupFolder || !safetyAndHealthFolder || !environmentFolder || !techSpecsFolder) {
				throw new Error("Error al crear la carpeta de arranque")
			}
		}

		logActivity({
			userId: session.user.id,
			module: MODULES.STARTUP_FOLDERS,
			action: ACTIVITY_TYPE.CREATE,
			entityId: startupFolder.id,
			entityType: "StartupFolder",
			metadata: {
				name,
				type,
				companyId,
			},
		})

		return {
			ok: true,
			message: "Carpeta de arranque creada correctamente",
			data: {
				folderId: startupFolder.id,
			},
		}
	} catch (error) {
		console.error("Error al crear la carpeta de arranque:", error)
		return {
			ok: false,
			message: "Error al crear la carpeta de arranque",
		}
	}
}
