"use server"

import prisma from "@/lib/prisma"

export const getDailyActivities = async (
	workBookId: string,
	limit: number = 10,
	page: number = 1
) => {
	try {
		const totalDailyActivities = await prisma.dailyActivity.count({
			where: {
				workBookId,
			},
		})

		const dailyActivities = await prisma.dailyActivity.findMany({
			where: {
				workBookId,
			},
			include: {
				personnel: true,
			},
			take: limit,
			skip: (page - 1) * limit,
		})

		return {
			ok: true,
			data: dailyActivities,
			total: totalDailyActivities,
		}
	} catch (error) {
		console.error(error)
		return {
			ok: false,
			message: "Error fetching daily activities",
		}
	}
}

export const getDailyActivityById = async (id: string) => {
	try {
		const dailyActivity = await prisma.dailyActivity.findUnique({
			where: {
				id,
			},
			include: {
				personnel: true,
			},
		})

		return {
			ok: true,
			data: dailyActivity,
		}
	} catch (error) {
		console.error(error)
		return {
			ok: false,
			message: "Error fetching daily activity",
		}
	}
}
