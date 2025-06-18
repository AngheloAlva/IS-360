"use server"

import prisma from "@/lib/prisma"
interface CreateStartupFolderProps {
	name: string
	companyId: string
}

export const createStartupFolderWithAll = async ({ name, companyId }: CreateStartupFolderProps) => {
	try {
		const company = await prisma.company.findUnique({
			where: {
				id: companyId,
			},
			select: {
				users: {
					select: {
						id: true,
					},
				},
				vehicles: {
					select: {
						id: true,
					},
				},
			},
		})

		if (!company) {
			return {
				ok: false,
				message: "Empresa no encontrada",
			}
		}

		return await prisma.$transaction(async (tx) => {
			const startupFolder = await tx.startupFolder.create({
				data: {
					name,
					companyId,
				},
			})

			const safetyAndHealthFolder = await tx.safetyAndHealthFolder.create({
				data: {
					startupFolder: {
						connect: {
							id: startupFolder.id,
						},
					},
				},
			})

			const environmentalFolder = await tx.environmentalFolder.create({
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
		})
	} catch (error) {
		console.error("Error al crear la carpeta de arranque:", error)
		return {
			ok: false,
			message: "Error al crear la carpeta de arranque",
		}
	}
}
