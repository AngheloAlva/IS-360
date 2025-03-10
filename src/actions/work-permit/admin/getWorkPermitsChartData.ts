"use server"

import prisma from "@/lib/prisma"
import { subMonths } from "date-fns"

export async function getWorkPermitsChartData() {
	const now = new Date()
	const sixMonthsAgo = subMonths(now, 6)

	// Obtener datos mensuales usando SQL raw para mejor rendimiento
	const monthlyData = await prisma.$queryRaw<
		Array<{
			month: string
			total: number
			active: number
			completed: number
		}>
	>`
		WITH months AS (
			SELECT date_trunc('month', d)::date as month
			FROM generate_series(
				${sixMonthsAgo}::timestamp,
				${now}::timestamp,
				'1 month'::interval
			) d
		)
		SELECT
			to_char(m.month, 'Mon') as month,
			COUNT(wp.id) as total,
			COUNT(CASE WHEN wp."workCompleted" = false THEN 1 END) as active,
			COUNT(CASE WHEN wp."workCompleted" = true THEN 1 END) as completed
		FROM months m
		LEFT JOIN "work_permit" wp ON date_trunc('month', wp."createdAt") = m.month
		GROUP BY m.month
		ORDER BY m.month ASC
	`

	// Obtener distribución por estado
	const statusDistribution = await prisma.$queryRaw<
		Array<{
			name: string
			value: number
		}>
	>`
		SELECT
			CASE
				WHEN "workCompleted" = true THEN 'Completados'
				ELSE 'En Progreso'
			END as name,
			COUNT(*) as value
		FROM "work_permit"
		GROUP BY "workCompleted"
		ORDER BY "workCompleted" DESC
	`

	return {
		monthlyData: monthlyData.map((data) => ({
			name: data.month,
			total: Number(data.total),
			active: Number(data.active),
			completed: Number(data.completed),
		})),
		statusDistribution: statusDistribution.map((status) => ({
			name: status.name,
			value: Number(status.value),
		})),
	}
}
