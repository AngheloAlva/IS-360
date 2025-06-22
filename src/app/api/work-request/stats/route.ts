import { NextResponse } from "next/server"
import { headers } from "next/headers"

import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(): Promise<NextResponse> {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return new NextResponse("No autorizado", { status: 401 })
	}

	const cacheConfig = {
		cacheStrategy: {
			ttl: 120,
			swr: 10,
		},
	}

	try {
		const [totalWorkRequests, totalPending, totalAttended, totalCancelled] = await Promise.all([
			prisma.workRequest.count(cacheConfig),
			prisma.workRequest.count({
				where: { status: "REPORTED" },
				...cacheConfig,
			}),
			prisma.workRequest.count({
				where: { status: "ATTENDED" },
				...cacheConfig,
			}),
			prisma.workRequest.count({
				where: { status: "CANCELLED" },
				...cacheConfig,
			}),
		])

		const [urgentAttended, urgentPending, nonUrgentAttended, nonUrgentPending] = await Promise.all([
			prisma.workRequest.count({
				where: {
					isUrgent: true,
					status: "ATTENDED",
				},
				...cacheConfig,
			}),
			prisma.workRequest.count({
				where: {
					isUrgent: true,
					status: "REPORTED",
				},
				...cacheConfig,
			}),
			prisma.workRequest.count({
				where: {
					isUrgent: false,
					status: "ATTENDED",
				},
				...cacheConfig,
			}),
			prisma.workRequest.count({
				where: {
					isUrgent: false,
					status: "REPORTED",
				},
				...cacheConfig,
			}),
		])

		const lastYear = new Date()
		lastYear.setMonth(lastYear.getMonth() - 11)
		lastYear.setDate(1)
		lastYear.setHours(0, 0, 0, 0)

		const monthlyStats = await prisma.$queryRaw<
			Array<{ year: number; month: number; status: string; count: bigint }>
		>`
			SELECT
				EXTRACT(YEAR FROM "requestDate") as year,
				EXTRACT(MONTH FROM "requestDate") as month,
				status,
				COUNT(*) as count
			FROM "work_request"
			WHERE
				"requestDate" >= ${lastYear}
				AND status IN ('REPORTED', 'ATTENDED')
			GROUP BY
				EXTRACT(YEAR FROM "requestDate"),
				EXTRACT(MONTH FROM "requestDate"),
				status
			ORDER BY
				year ASC,
				month ASC
		`

		const months: { month: string; created: number; attended: number }[] = []
		const currentDate = new Date()
		const startDate = new Date(currentDate)
		startDate.setMonth(currentDate.getMonth() - 11) // Últimos 12 meses incluyendo el actual

		for (let i = 0; i < 12; i++) {
			const date = new Date(startDate)
			date.setMonth(startDate.getMonth() + i)
			months.push({
				month: date.toISOString().substring(0, 7), // Formato YYYY-MM
				created: 0,
				attended: 0,
			})
		}

		monthlyStats.forEach((stat) => {
			const statDate = new Date(stat.year, stat.month - 1) // PostgreSQL months son 1-12
			const monthDiff =
				(statDate.getFullYear() - startDate.getFullYear()) * 12 +
				(statDate.getMonth() - startDate.getMonth())

			if (monthDiff >= 0 && monthDiff < 12) {
				if (stat.status === "REPORTED") {
					months[monthDiff].created = Number(stat.count)
				} else if (stat.status === "ATTENDED") {
					months[monthDiff].attended = Number(stat.count)
				}
			}
		})

		return NextResponse.json({
			totalWorkRequests,
			totalPending,
			totalAttended,
			totalCancelled,
			urgencyStats: {
				urgent: {
					attended: urgentAttended,
					pending: urgentPending,
				},
				nonUrgent: {
					attended: nonUrgentAttended,
					pending: nonUrgentPending,
				},
			},
			monthlyTrend: months,
		})
	} catch (error) {
		console.error("Error fetching work request stats:", error)
		return NextResponse.json({ error: "Error fetching work request stats" }, { status: 500 })
	}
}
