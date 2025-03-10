/* eslint-disable @typescript-eslint/no-explicit-any */
"use server"

import prisma from "@/lib/prisma"
import { subMonths } from "date-fns"

export async function getWorkBooksChartData() {
	const now = new Date()
	const sixMonthsAgo = subMonths(now, 5)

	const [monthlyData, statusDistribution] = (await Promise.all([
		prisma.$queryRaw`
			WITH months AS (
				SELECT generate_series(
					date_trunc('month', ${sixMonthsAgo}::timestamp),
					date_trunc('month', ${now}::timestamp),
					'1 month'::interval
				) as month
			)
			SELECT
				to_char(m.month, 'TMMonth') as name,
				COALESCE(COUNT(wb."id"), 0) as total,
				COALESCE(COUNT(*) FILTER (WHERE wb."workStatus" = 'planificado'), 0) as active,
				COALESCE(COUNT(*) FILTER (WHERE wb."workStatus" = 'completado'), 0) as completed
			FROM months m
			LEFT JOIN "work_book" wb ON date_trunc('month', wb."createdAt") = m.month
			GROUP BY m.month
			ORDER BY m.month ASC
		`,
		prisma.$queryRaw`
			SELECT
				"workStatus" as name,
				COUNT(*) as value
			FROM "work_book"
			GROUP BY "workStatus"
			ORDER BY value DESC
		`,
	])) as [any, any]

	return {
		monthlyData: monthlyData.map((month: any) => ({
			name: month.name,
			total: Number(month.total),
			active: Number(month.active),
			completed: Number(month.completed),
		})),
		statusDistribution: statusDistribution.map((status: any) => ({
			name: status.name,
			value: Number(status.value),
		})),
	}
}
