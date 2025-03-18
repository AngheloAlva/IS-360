"use server"

import prisma from "@/lib/prisma"
import { startOfMonth, subMonths } from "date-fns"

export async function getWorkBooksOverview() {
	const now = new Date()
	const startOfCurrentMonth = startOfMonth(now)
	const startOfLastMonth = startOfMonth(subMonths(now, 1))

	const currentMonthQuery = prisma.$queryRaw`
		SELECT
			COUNT(*) as current_total,
			COUNT(*) FILTER (WHERE "workStatus" = 'planificado') as current_active
		FROM work_book
		WHERE "createdAt" >= ${startOfCurrentMonth}
	`

	const lastMonthQuery = prisma.$queryRaw`
		SELECT
			COUNT(*) as last_total,
			COUNT(*) FILTER (WHERE "workStatus" = 'planificado') as last_active
		FROM work_book
		WHERE "createdAt" >= ${startOfLastMonth} AND "createdAt" < ${startOfCurrentMonth}
	`

	const [currentMonth, lastMonth] = (await Promise.all([
		currentMonthQuery,
		lastMonthQuery,
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	])) as [any, any]

	const calculateChange = (current: number, last: number) => {
		if (last === 0) return current > 0 ? 100 : 0
		return Number((((current - last) / last) * 100).toFixed(1))
	}

	return {
		total: {
			current: Number(currentMonth[0].current_total),
			change: calculateChange(
				Number(currentMonth[0].current_total),
				Number(lastMonth[0].last_total)
			),
		},
		active: {
			current: Number(currentMonth[0].current_active),
			change: calculateChange(
				Number(currentMonth[0].current_active),
				Number(lastMonth[0].last_active)
			),
		},
	}
}
