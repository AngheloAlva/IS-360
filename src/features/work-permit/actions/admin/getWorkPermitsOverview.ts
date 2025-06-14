"use server"

import { addMonths, startOfMonth, endOfMonth } from "date-fns"

import prisma from "@/lib/prisma"

export async function getWorkPermitsOverview() {
	const now = new Date()
	const startOfCurrentMonth = startOfMonth(now)
	const endOfCurrentMonth = endOfMonth(now)
	const startOfLastMonth = startOfMonth(addMonths(now, -1))
	const endOfLastMonth = endOfMonth(addMonths(now, -1))

	// Obtener datos del mes actual y anterior usando una sola consulta
	const monthlyStats = await prisma.$queryRaw<
		Array<{
			month: string
			total: number
			active: number
			completed: number
			canceled: number
		}>
	>`
		WITH monthly_data AS (
			SELECT
				CASE
					WHEN "createdAt" >= ${startOfCurrentMonth}::timestamp AND "createdAt" <= ${endOfCurrentMonth}::timestamp THEN 'current'
					WHEN "createdAt" >= ${startOfLastMonth}::timestamp AND "createdAt" <= ${endOfLastMonth}::timestamp THEN 'last'
				END as month,
				"workCompleted"
			FROM "work_permit"
			WHERE "createdAt" >= ${startOfLastMonth}::timestamp AND "createdAt" <= ${endOfCurrentMonth}::timestamp
		)
		SELECT
			month,
			COUNT(*) as total,
			COUNT(CASE WHEN "workCompleted" = true THEN 1 END) as completed
		FROM monthly_data
		GROUP BY month
	`

	// Obtener datos del mes actual y anterior
	const currentMonth = monthlyStats.find((stat) => stat.month === "current") || {
		total: 0,
		active: 0,
		completed: 0,
		canceled: 0,
	}
	const lastMonth = monthlyStats.find((stat) => stat.month === "last") || {
		total: 0,
		active: 0,
		completed: 0,
		canceled: 0,
	}

	// Calcular cambios porcentuales
	const calculateChange = (current: number, last: number) =>
		last === 0 ? 0 : Math.round(((current - last) / last) * 100)

	return {
		total: {
			current: Number(currentMonth.total),
			change: calculateChange(Number(currentMonth.total), Number(lastMonth.total)),
		},
		active: {
			current: Number(currentMonth.active),
			change: calculateChange(Number(currentMonth.active), Number(lastMonth.active)),
		},
		completed: {
			current: Number(currentMonth.completed),
			change: calculateChange(Number(currentMonth.completed), Number(lastMonth.completed)),
		},
		canceled: {
			current: Number(currentMonth.canceled),
			change: calculateChange(Number(currentMonth.canceled), Number(lastMonth.canceled)),
		},
	}
}
