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
		const [totalWorkRequests, totalPending, totalAttended, totalUrgent, totalCancelled] =
			await Promise.all([
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
					where: { isUrgent: true },
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

		// Modificar para obtener datos de los últimos 30 días en lugar de 12 meses
		const last30Days = new Date()
		last30Days.setDate(last30Days.getDate() - 30)
		last30Days.setHours(0, 0, 0, 0)

		const dailyStats = await prisma.$queryRaw<
			Array<{ date: Date; status: string; count: bigint }>
		>`
			SELECT
				DATE("requestDate") as date,
				status,
				COUNT(*) as count
			FROM "work_request"
			WHERE
				"requestDate" >= ${last30Days}
				AND status IN ('REPORTED', 'ATTENDED')
			GROUP BY
				DATE("requestDate"),
				status
			ORDER BY
				date ASC
		`

		const days: { month: string; created: number; attended: number }[] = []
		const currentDate = new Date()
		const startDate = new Date(currentDate)
		startDate.setDate(currentDate.getDate() - 29) // Últimos 30 días incluyendo el actual

		// Crear un array con los últimos 30 días
		for (let i = 0; i < 30; i++) {
			const date = new Date(startDate)
			date.setDate(startDate.getDate() + i)
			days.push({
				month: date.toISOString().split('T')[0], // Formato YYYY-MM-DD
				created: 0,
				attended: 0,
			})
		}

		// Asignar los valores de las estadísticas a los días correspondientes
		dailyStats.forEach((stat) => {
			const statDate = new Date(stat.date)
			const dayDiff = Math.floor(
				(statDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
			)

			if (dayDiff >= 0 && dayDiff < 30) {
				if (stat.status === "REPORTED") {
					days[dayDiff].created = Number(stat.count)
				} else if (stat.status === "ATTENDED") {
					days[dayDiff].attended = Number(stat.count)
				}
			}
		})

		return NextResponse.json({
			totalWorkRequests,
			totalPending,
			totalAttended,
			totalUrgent,
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
			monthlyTrend: days, // Ahora contiene datos diarios de los últimos 30 días
		})
	} catch (error) {
		console.error("Error fetching work request stats:", error)
		return NextResponse.json({ error: "Error fetching work request stats" }, { status: 500 })
	}
}
