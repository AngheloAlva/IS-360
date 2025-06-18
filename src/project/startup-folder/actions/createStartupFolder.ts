"use server"

import { StartupFolderType } from "@prisma/client"
import prisma from "@/lib/prisma"

interface CreateStartupFolderProps {
	name: string
	companyId: string
	type: StartupFolderType
}

export const createStartupFolder = async ({ name, companyId, type }: CreateStartupFolderProps) => {
	try {
		const startupFolder = await prisma.startupFolder.create({
			data: {
				name,
				type,
				companyId,
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

			const environmentalFolder = await prisma.environmentalFolder.create({
				data: {
					startupFolder: {
						connect: {
							id: startupFolder.id,
						},
					},
				},
			})

			if (!startupFolder || !safetyAndHealthFolder || !environmentalFolder) {
				throw new Error("Error al crear la carpeta de arranque")
			}
		} else if (type === StartupFolderType.BASIC) {
			const basicFolder = await prisma.basicFolder.create({
				data: {
					startupFolder: {
						connect: {
							id: startupFolder.id,
						},
					},
				},
			})

			if (!startupFolder || !basicFolder) {
				throw new Error("Error al crear la carpeta básica")
			}
		}

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
