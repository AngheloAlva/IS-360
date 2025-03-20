"use server"

import prisma from "@/lib/prisma"

export const getEquipment = async (limit: number = 10, page: number = 1) => {
	try {
		const equipments = await prisma.equipment.findMany({
			take: limit,
			skip: (page - 1) * limit,
		})

		return {
			ok: true,
			data: equipments,
		}
	} catch (error) {
		console.log(error)

		return {
			ok: false,
			message: "Error al cargar los equipos",
		}
	}
}
