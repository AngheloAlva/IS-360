"use server"

import prisma from "@/lib/prisma"

export const getFolderById = async (id: string) => {
	try {
		const folder = await prisma.folder.findUnique({
			where: {
				id,
			},
			cacheStrategy: {
				ttl: 10,
			},
		})

		return { ok: true, data: folder }
	} catch (error) {
		console.error("Error al obtener la carpeta:", error)
		return { ok: false, message: "Error al obtener la carpeta" }
	}
}
