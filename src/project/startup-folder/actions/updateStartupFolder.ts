"use server"

import prisma from "@/lib/prisma"

interface UpdateStartupFolderProps {
	name: string
	startupFolderId: string
}

export const updateStartupFolder = async ({ name, startupFolderId }: UpdateStartupFolderProps) => {
	try {
		const startupFolder = await prisma.startupFolder.update({
			where: {
				id: startupFolderId,
			},
			data: {
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
