"use server"

import prisma from "@/lib/prisma"

export const createUserStartupFolder = async (userId: string) => {
	try {
		const user = await prisma.user.findUnique({
			where: {
				id: userId,
			},
			select: {
				id: true,
				companyId: true,
			},
		})

		if (!user || !user.companyId) {
			return {
				ok: false,
				message: "Usuario no encontrado",
			}
		}

		await prisma.workerFolder.create({
			data: {
				worker: {
					connect: {
						id: userId,
					},
				},
			},
		})

		return {
			ok: true,
			message: "Carpeta inicial creada exitosamente",
		}
	} catch (error) {
		console.error("[CREATE_USER_STARTUP_FOLDER]", error)
		return {
			ok: false,
			message: "Error al crear la carpeta inicial",
		}
	}
}
