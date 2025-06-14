import { NextResponse } from "next/server"

import prisma from "@/lib/prisma"

import type { WORK_ORDER_STATUS } from "@prisma/client"

export async function GET() {
	try {
		const workBookStats = await prisma.workOrder.groupBy({
			by: ["status"],
			where: {
				isWorkBook: true,
			},
			_count: {
				_all: true,
			},
			cacheStrategy: {
				ttl: 10,
			},
		})

		const statusColors = {
			PENDING: "var(--chart-1)",
			IN_PROGRESS: "var(--chart-2)",
			COMPLETED: "var(--chart-3)",
			CANCELLED: "var(--chart-4)",
			EXPIRED: "var(--chart-5)",
		} as const

		const formattedData = workBookStats.map(
			(stat: { status: WORK_ORDER_STATUS; _count: { _all: number } }) => ({
				status: stat.status,
				count: stat._count._all,
				fill: statusColors[stat.status as keyof typeof statusColors],
			})
		)

		return NextResponse.json(formattedData)
	} catch (error) {
		console.error("Error fetching work book status stats:", error)
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
	}
}
