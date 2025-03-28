import { NextResponse } from "next/server"

import prisma from "@/lib/prisma"

interface WeeklyData {
	week: string
	total: number
	count: number
}

export async function GET() {
	try {
		// Get progress for the last 12 weeks
		const twelveWeeksAgo = new Date()
		twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 12 * 7)

		const workBooks = await prisma.workOrder.findMany({
			where: {
				isWorkBook: true,
				createdAt: {
					gte: twelveWeeksAgo,
				},
			},
			select: {
				workProgressStatus: true,
				createdAt: true,
			},
		})

		// Group by week and calculate average progress
		const weeklyData = workBooks.reduce<Record<string, WeeklyData>>((acc, book) => {
			const week = `Semana ${Math.ceil((book.createdAt.getTime() - twelveWeeksAgo.getTime()) / (7 * 24 * 60 * 60 * 1000))}`

			if (!acc[week]) {
				acc[week] = {
					week,
					total: 0,
					count: 0,
				}
			}

			acc[week].total += book.workProgressStatus || 0
			acc[week].count++

			return acc
		}, {})

		// Calculate averages and format data
		const formattedData = Object.values(weeklyData)
			.map((data: WeeklyData) => ({
				week: data.week,
				avgProgress: Math.round(data.total / data.count),
			}))
			.sort((a, b) => {
				const weekA = parseInt(a.week.split(" ")[1])
				const weekB = parseInt(b.week.split(" ")[1])
				return weekA - weekB
			})

		return NextResponse.json(formattedData)
	} catch (error) {
		console.error("Error fetching work book progress stats:", error)
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
	}
}
