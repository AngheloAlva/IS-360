"use server"

import prisma from "@/lib/prisma"

export const getAdditionalActivities = async (
	workBookId: string,
	limit: number = 10,
	page: number = 1
) => {
	try {
		const total = await prisma.aditionalActivity.count({
			where: {
				workBookId: workBookId,
			},
		})

		const additionalActivities = await prisma.aditionalActivity.findMany({
			where: {
				workBookId: workBookId,
			},
			take: limit,
			skip: (page - 1) * limit,
		})

		return {
			total,
			ok: true,
			data: additionalActivities,
		}
	} catch (error) {
		console.error(error)
		return {
			ok: false,
			message: "Error fetching additional activities",
		}
	}
}
