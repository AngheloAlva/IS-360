import { NextResponse } from "next/server"
import { headers } from "next/headers"

import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

import type { WORK_ORDER_STATUS } from "@prisma/client"

export async function GET(): Promise<NextResponse> {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return new NextResponse("No autorizado", { status: 401 })
	}

	try {
		const workBookStats = await prisma.workOrder.groupBy({
			by: ["status"],
			_count: {
				_all: true,
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
