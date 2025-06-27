import { headers } from "next/headers"
import { NextResponse } from "next/server"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		})

		if (!session?.user) {
			return NextResponse.json({ error: "No autorizado" }, { status: 401 })
		}

		// Distribución por categoría
		const byCategory = await prisma.userSafetyTalk.groupBy({
			by: ["category"],
			_count: true,
		})

		// Distribución por estado
		const byStatus = await prisma.userSafetyTalk.groupBy({
			by: ["status"],
			_count: true,
		})

		// Tendencia por mes (últimos 6 meses)
		const sixMonthsAgo = new Date()
		sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

		const byMonth = await prisma.userSafetyTalk.groupBy({
			by: ["completedAt"],
			where: {
				completedAt: {
					gte: sixMonthsAgo,
					not: null,
				},
			},
			_count: true,
		})

		// Procesar datos para el gráfico de tendencia
		const monthlyTrend = byMonth.reduce(
			(acc, curr) => {
				if (!curr.completedAt) return acc

				const month = curr.completedAt.toLocaleString("es", { month: "long" })
				acc[month] = (acc[month] || 0) + curr._count
				return acc
			},
			{} as Record<string, number>
		)

		return NextResponse.json({
			byCategory: byCategory.map((item) => ({
				name: item.category,
				value: item._count,
			})),
			byStatus: byStatus.map((item) => ({
				name: item.status,
				value: item._count,
			})),
			monthlyTrend: Object.entries(monthlyTrend).map(([month, count]) => ({
				name: month,
				value: count,
			})),
		})
	} catch (error) {
		console.error("[SAFETY_TALKS_CHARTS]", error)
		return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
	}
}
