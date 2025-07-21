import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"

// Importar también WORK_ORDER_PRIORITY
import {
	MILESTONE_STATUS,
	WORK_ORDER_STATUS,
	WORK_ORDER_TYPE,
	WORK_ORDER_PRIORITY,
} from "@prisma/client"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET(req: NextRequest): Promise<NextResponse> {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return new NextResponse("No autorizado", { status: 401 })
	}

	try {
		// Obtener parámetros de filtro
		const searchParams = req.nextUrl.searchParams
		const search = searchParams.get("search") || ""
		const typeFilter = searchParams.get("typeFilter") || null
		const statusFilter = searchParams.get("statusFilter") || null
		const priorityFilter = searchParams.get("priorityFilter") || null
		const companyId = searchParams.get("companyId") || null
		const startDate = searchParams.get("startDate") || null
		const endDate = searchParams.get("endDate") || null
		const onlyWithRequestClousure = searchParams.get("onlyWithRequestClousure") === "true"

		const isValidType =
			typeFilter && Object.values(WORK_ORDER_TYPE).includes(typeFilter as WORK_ORDER_TYPE)
		const isValidStatus =
			statusFilter && Object.values(WORK_ORDER_STATUS).includes(statusFilter as WORK_ORDER_STATUS)
		const isValidPriority =
			priorityFilter &&
			Object.values(WORK_ORDER_PRIORITY).includes(priorityFilter as WORK_ORDER_PRIORITY)

		// Construir filtro común para todas las consultas
		const filter = {
			...(search
				? {
						OR: [
							{ workName: { contains: search, mode: "insensitive" as const } },
							{ workLocation: { contains: search, mode: "insensitive" as const } },
							{ otNumber: { contains: search, mode: "insensitive" as const } },
						],
					}
				: {}),
			...(isValidStatus ? { status: statusFilter as WORK_ORDER_STATUS } : {}),
			...(isValidPriority ? { priority: priorityFilter as WORK_ORDER_PRIORITY } : {}),
			...(isValidType ? { type: typeFilter as WORK_ORDER_TYPE } : {}),
			...(companyId ? { companyId: companyId } : {}),
			...(startDate || endDate
				? {
						solicitationDate: {
							...(startDate ? { gte: new Date(startDate) } : {}),
							...(endDate ? { lte: new Date(endDate) } : {}),
						},
					}
				: {}),
			...(onlyWithRequestClousure
				? {
						milestones: {
							some: {
								status: MILESTONE_STATUS.REQUESTED_CLOSURE,
							},
						},
					}
				: {}),
		}

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
			prisma.workOrder.count({
				where: filter,
			}),

			prisma.workOrder.groupBy({
				by: ["status"],
				_count: {
					id: true,
				},
				where: filter,
			}),

			prisma.workOrder.groupBy({
				by: ["priority"],
				_count: {
					id: true,
				},
				where: filter,
			}),

			prisma.workOrder.groupBy({
				by: ["type"],
				_count: {
					id: true,
				},
				where: filter,
			}),

			prisma.workOrder.findMany({
				where: filter,
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
							workOrders: {
								where: filter,
							},
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

			// Para la consulta SQL raw, necesitamos construir condiciones dinámicamente
			// Esta es una simplificación, podrías necesitar ajustarla según tus necesidades
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
					...filter,
					workProgressStatus: {
						not: null,
					},
				},
			}),
		])

		const typeColors = {
			[WORK_ORDER_TYPE.PREVENTIVE]: "var(--color-orange-500)",
			[WORK_ORDER_TYPE.PREDICTIVE]: "var(--color-yellow-500)",
			[WORK_ORDER_TYPE.PROACTIVE]: "var(--color-amber-500)",
			[WORK_ORDER_TYPE.CORRECTIVE]: "var(--color-red-500)",
		}

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
				fill: typeColors[item.type],
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
