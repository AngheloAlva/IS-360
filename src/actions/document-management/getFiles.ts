"use server"

import prisma from "@/lib/prisma"

export const getFileById = async (id: string) => {
	try {
		const file = await prisma.file.findUnique({
			where: {
				id,
			},
		})

		return { ok: true, data: file }
	} catch (error) {
		console.error("Error al obtener el archivo:", error)
		return { ok: false, message: "Error al obtener el archivo" }
	}
}
