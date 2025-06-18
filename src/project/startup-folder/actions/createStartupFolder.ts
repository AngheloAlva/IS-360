"use server"

import prisma from "@/lib/prisma"

interface CreateStartupFolderProps {
	name: string
	companyId: string
}

export const createStartupFolder = async ({ name, companyId }: CreateStartupFolderProps) => {
	try {
		const startupFolder = await prisma.startupFolder.create({
			data: {
				name,
				companyId,
			},
		})

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
			return {
				ok: false,
				message: "Error al crear la carpeta de arranque",
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
