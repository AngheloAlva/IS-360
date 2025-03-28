import { NextResponse } from "next/server"

import prisma from "@/lib/prisma"

interface MonthlyData {
	month: string
	dailyActivity: number
	additionalActivity: number
	inspection: number
}

export async function GET() {
	try {
		// Get entries for the last 6 months
		const sixMonthsAgo = new Date()
		sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

		const workEntries = await prisma.workEntry.findMany({
			where: {
				workOrder: {
					isWorkBook: true,
				},
				createdAt: {
					gte: sixMonthsAgo,
				},
			},
			select: {
				entryType: true,
				createdAt: true,
			},
		})

		// Group entries by month and type
		const monthlyData = workEntries.reduce<Record<string, MonthlyData>>((acc, entry) => {
			const month = entry.createdAt.toLocaleString("es-ES", { month: "long" })
			const monthKey = month.charAt(0).toUpperCase() + month.slice(1)

			if (!acc[monthKey]) {
				acc[monthKey] = {
					month: monthKey,
					dailyActivity: 0,
					additionalActivity: 0,
					inspection: 0,
				}
			}

			switch (entry.entryType) {
				case "DAILY_ACTIVITY":
					acc[monthKey].dailyActivity++
					break
				case "ADDITIONAL_ACTIVITY":
					acc[monthKey].additionalActivity++
					break
				case "OTC_INSPECTION":
					acc[monthKey].inspection++
					break
			}

			return acc
		}, {})

		// Convert to array and sort by month
		const formattedData = Object.values(monthlyData)

		return NextResponse.json(formattedData)
	} catch (error) {
		console.error("Error fetching work book entries stats:", error)
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
	}
}
