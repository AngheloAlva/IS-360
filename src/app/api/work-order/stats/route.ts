import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { WORK_ORDER_STATUS, WORK_ORDER_PRIORITY } from "@prisma/client"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(): Promise<NextResponse> {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return new NextResponse("No autorizado", { status: 401 })
	}

	try {
		// Realizar consultas en paralelo para mejorar el rendimiento
		const [
			// Conteo total de órdenes de trabajo
			totalWorkOrders,
			// Conteo por estado
			statusCounts,
			// Conteo por prioridad
			priorityCounts,
			// Órdenes de trabajo por tipo
			typeDistribution,
			// Órdenes de trabajo recientes (para gráfico de tendencia)
			recentWorkOrders,
			// Top empresas con más órdenes
			topCompanies,
			// Órdenes de trabajo por mes (para gráfico de tendencia anual)
			monthlyWorkOrders,
			// Porcentaje de finalización (promedio)
			avgProgress,
		] = await Promise.all([
			// Total de órdenes de trabajo
			prisma.workOrder.count(),

			// Conteo por estado
			prisma.workOrder.groupBy({
				by: ["status"],
				_count: {
					id: true,
				},
			}),

			// Conteo por prioridad
			prisma.workOrder.groupBy({
				by: ["priority"],
				_count: {
					id: true,
				},
			}),

			// Distribución por tipo
			prisma.workOrder.groupBy({
				by: ["type"],
				_count: {
					id: true,
				},
			}),

			// Órdenes de trabajo recientes (últimos 7 días)
			prisma.workOrder.findMany({
				where: {
					createdAt: {
						gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 días atrás
					},
				},
				orderBy: {
					createdAt: "desc",
				},
				select: {
					id: true,
					otNumber: true,
					status: true,
					priority: true,
					createdAt: true,
					workName: true,
					workProgressStatus: true,
					company: {
						select: {
							name: true,
						},
					},
				},
				take: 10,
			}),

			// Top empresas con más órdenes de trabajo
			prisma.company.findMany({
				select: {
					id: true,
					name: true,
					_count: {
						select: {
							workOrders: true,
						},
					},
				},
				orderBy: {
					workOrders: {
						_count: "desc",
					},
				},
				take: 5,
			}),

			// Órdenes de trabajo por mes (para el año actual)
			prisma.$queryRaw`
        SELECT
          EXTRACT(MONTH FROM "createdAt") as month,
          COUNT(*) as count
        FROM
          work_order
        WHERE
          "createdAt" >= DATE_TRUNC('year', CURRENT_DATE)
        GROUP BY
          EXTRACT(MONTH FROM "createdAt")
        ORDER BY
          month ASC
      `,

			// Promedio de porcentaje de progreso
			prisma.workOrder.aggregate({
				_avg: {
					workProgressStatus: true,
				},
				where: {
					workProgressStatus: {
						not: null,
					},
				},
			}),
		])

		// Preparar datos para la respuesta
		const statusCountsFormatted = Object.fromEntries(
			statusCounts.map((item) => [item.status, item._count.id])
		)

		const priorityCountsFormatted = Object.fromEntries(
			priorityCounts.map((item) => [item.priority, item._count.id])
		)

		// Formatear datos para las tarjetas
		const cards = {
			total: totalWorkOrders,
			inProgress: statusCountsFormatted[WORK_ORDER_STATUS.IN_PROGRESS] || 0,
			highPriority: priorityCountsFormatted[WORK_ORDER_PRIORITY.HIGH] || 0,
			completed: statusCountsFormatted[WORK_ORDER_STATUS.COMPLETED] || 0,
		}

		// Formatear datos para gráficos
		const charts = {
			status: statusCounts.map((item) => ({
				name: item.status,
				value: item._count.id,
			})),
			priority: priorityCounts.map((item) => ({
				name: item.priority,
				value: item._count.id,
			})),
			type: typeDistribution.map((item) => ({
				name: item.type,
				value: item._count.id,
			})),
			companies: topCompanies.map((company) => ({
				name: company.name,
				value: company._count.workOrders,
			})),
			monthly: (monthlyWorkOrders as Array<{ month: number; count: string }>).map((item) => ({
				month: Number(item.month),
				count: Number(item.count),
			})),
			averageProgress: Math.round((avgProgress._avg.workProgressStatus || 0) * 100) / 100,
		}

		// Construir la respuesta
		return NextResponse.json({
			cards,
			charts,
			recentWorkOrders,
		})
	} catch (error) {
		console.error("Error obteniendo estadísticas de órdenes de trabajo:", error)
		return NextResponse.json(
			{ error: "Error obteniendo estadísticas de órdenes de trabajo" },
			{ status: 500 }
		)
	}
}
