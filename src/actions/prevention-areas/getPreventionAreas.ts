"use server"

import prisma from "@/lib/prisma"

export const getPreventionAreas = async (
	workBookId: string,
	limit: number = 10,
	page: number = 1
) => {
	try {
		const totalAreas = await prisma.preventionArea.count({
			where: {
				workBookId,
			},
		})

		const preventionAreas = await prisma.preventionArea.findMany({
			where: {
				workBookId,
			},
			take: limit,
			skip: (page - 1) * limit,
		})

		return {
			ok: true,
			data: preventionAreas,
			total: totalAreas,
		}
	} catch (error) {
		console.error(error)
		return {
			ok: false,
			message: "Error al obtener las áreas de prevención",
		}
	}
}
