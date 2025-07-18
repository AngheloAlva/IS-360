import { NextResponse } from "next/server"
import { headers } from "next/headers"

import { WORK_ORDER_STATUS } from "@prisma/client"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET(): Promise<NextResponse> {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return new NextResponse("No autorizado", { status: 401 })
	}

	try {
		const [
			totalWorkOrders,
			statusCounts,
			priorityCounts,
			typeDistribution,
			recentWorkOrders,
			topCompanies,
			monthlyWorkOrders,
			avgProgress,
		] = await Promise.all([
			prisma.workOrder.count(),

			prisma.workOrder.groupBy({
				by: ["status"],
				_count: {
					id: true,
				},
			}),

			prisma.workOrder.groupBy({
				by: ["priority"],
				_count: {
					id: true,
				},
			}),

			prisma.workOrder.groupBy({
				by: ["type"],
				_count: {
					id: true,
				},
			}),

			prisma.workOrder.findMany({
				where: {
					createdAt: {},
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

		const statusCountsFormatted = Object.fromEntries(
			statusCounts.map((item) => [item.status, item._count.id])
		)

		const cards = {
			total: totalWorkOrders,
			planned: statusCountsFormatted[WORK_ORDER_STATUS.PLANNED] || 0,
			inProgress: statusCountsFormatted[WORK_ORDER_STATUS.IN_PROGRESS] || 0,
			completed: statusCountsFormatted[WORK_ORDER_STATUS.COMPLETED] || 0,
		}

		const charts = {
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
