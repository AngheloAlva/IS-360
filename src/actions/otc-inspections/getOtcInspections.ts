"use server"

import prisma from "@/lib/prisma"

export const getOtcInspections = async (
	workBookId: string,
	limit: number = 10,
	page: number = 1
) => {
	try {
		const totalInspectors = await prisma.otcInspection.count({
			where: {
				workBookId,
			},
		})

		const inspectors = await prisma.otcInspection.findMany({
			where: {
				workBookId,
			},

			take: limit,
			skip: (page - 1) * limit,
		})

		return {
			ok: true,
			data: inspectors,
			total: totalInspectors,
		}
	} catch (error) {
		console.error(error)
		return {
			ok: false,
			message: "Error fetching inspectors",
		}
	}
}
