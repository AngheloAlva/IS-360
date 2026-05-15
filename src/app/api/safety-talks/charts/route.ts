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

		// Distribución por categoría - Usuarios internos
		const byCategoryInternal = await prisma.userSafetyTalk.groupBy({
			by: ["category"],
			_count: true,
		})

		// Distribución por categoría - Usuarios externos
		const byCategoryExternal = await prisma.visitorTalkCompletion.findMany({
			where: {
				status: "COMPLETED",
				passed: true,
			},
			select: {
				visitorTalk: {
					select: {
						category: true,
					},
				},
			},
		})

		// Combinar categorías
		const categoryMap = new Map<string, number>()
		byCategoryInternal.forEach((item) => {
			categoryMap.set(item.category, item._count)
		})
		byCategoryExternal.forEach((item) => {
			const category = item.visitorTalk.category
			categoryMap.set(category, (categoryMap.get(category) || 0) + 1)
		})

		// Distribución por estado - Usuarios internos
		const byStatusInternal = await prisma.userSafetyTalk.groupBy({
			by: ["status"],
			_count: true,
		})

		// Usuarios externos siempre son PASSED (solo contamos los que completaron exitosamente)
		const externalPassedCount = await prisma.visitorTalkCompletion.count({
			where: {
				status: "COMPLETED",
				passed: true,
			},
		})

		// Combinar estados
		const statusMap = new Map<string, number>()
		byStatusInternal.forEach((item) => {
			statusMap.set(item.status, item._count)
		})
		statusMap.set("PASSED", (statusMap.get("PASSED") || 0) + externalPassedCount)

		// Tendencia por mes (últimos 6 meses)
		const sixMonthsAgo = new Date()
		sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

		// Usuarios internos
		const byMonthInternal = await prisma.userSafetyTalk.groupBy({
			by: ["completedAt"],
			where: {
				completedAt: {
					gte: sixMonthsAgo,
					not: null,
				},
			},
			_count: true,
		})

		// Usuarios externos
		const byMonthExternal = await prisma.visitorTalkCompletion.findMany({
			where: {
				status: "COMPLETED",
				passed: true,
				completedAt: {
					gte: sixMonthsAgo,
					not: null,
				},
			},
			select: {
				completedAt: true,
			},
		})

		// Procesar datos para el gráfico de tendencia
		const monthlyTrend: Record<string, number> = {}

		byMonthInternal.forEach((item) => {
			if (!item.completedAt) return
			const month = item.completedAt.toLocaleString("es", { month: "long" })
			monthlyTrend[month] = (monthlyTrend[month] || 0) + item._count
		})

		byMonthExternal.forEach((item) => {
			if (!item.completedAt) return
			const month = item.completedAt.toLocaleString("es", { month: "long" })
			monthlyTrend[month] = (monthlyTrend[month] || 0) + 1
		})

		return NextResponse.json({
			byCategory: Array.from(categoryMap.entries()).map(([name, value]) => ({
				name,
				value,
			})),
			byStatus: Array.from(statusMap.entries()).map(([name, value]) => ({
				name,
				value,
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
