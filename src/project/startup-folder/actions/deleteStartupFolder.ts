"use server"

import prisma from "@/lib/prisma"

interface DeleteStartupFolderProps {
	startupFolderId: string
}

export const deleteStartupFolder = async ({ startupFolderId }: DeleteStartupFolderProps) => {
	try {
		const startupFolder = await prisma.startupFolder.findUnique({
			where: {
				id: startupFolderId,
			},
			select: {
				id: true,
				safetyAndHealthFolders: true,
				environmentalFolders: true,
				vehiclesFolders: true,
				workersFolders: true,
			},
		})

		if (!startupFolder) {
			return {
				ok: false,
				message: "Carpeta de arranque no encontrada",
			}
		}

		for (const safetyAndHealthFolder of startupFolder.safetyAndHealthFolders) {
			await prisma.safetyAndHealthDocument.deleteMany({
				where: {
					folderId: safetyAndHealthFolder.id,
				},
			})
		}

		for (const environmentalFolder of startupFolder.environmentalFolders) {
			await prisma.environmentalDocument.deleteMany({
				where: {
					folderId: environmentalFolder.id,
				},
			})
		}

		for (const vehiclesFolder of startupFolder.vehiclesFolders) {
			await prisma.vehicleDocument.deleteMany({
				where: {
					folderId: vehiclesFolder.id,
				},
			})
		}

		for (const workersFolder of startupFolder.workersFolders) {
			await prisma.workerDocument.deleteMany({
				where: {
					folderId: workersFolder.id,
				},
			})
		}

		await prisma.safetyAndHealthFolder.deleteMany({
			where: {
				startupFolderId: startupFolder.id,
			},
		})

		await prisma.environmentalFolder.deleteMany({
			where: {
				startupFolderId: startupFolder.id,
			},
		})

		await prisma.vehicleFolder.deleteMany({
			where: {
				startupFolderId: startupFolder.id,
			},
		})

		await prisma.workerFolder.deleteMany({
			where: {
				startupFolderId: startupFolder.id,
			},
		})

		await prisma.startupFolder.delete({
			where: {
				id: startupFolder.id,
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
