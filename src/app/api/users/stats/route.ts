import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { format } from "date-fns"

import { USER_ROLE } from "@prisma/client"
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
		// Estadísticas básicas
		const [totalUsers, twoFactorEnabled, totalContractors, totalSupervisors] = await Promise.all([
			prisma.user.count({
				where: {
					accessRole: USER_ROLE.ADMIN,
					isActive: true,
				},
			}),
			prisma.user.count({
				where: {
					isActive: true,
					twoFactorEnabled: true,
					accessRole: USER_ROLE.ADMIN,
				},
			}),
			prisma.user.count({
				where: {
					isActive: true,
					accessRole: USER_ROLE.PARTNER_COMPANY,
				},
			}),
			prisma.user.count({
				where: {
					isActive: true,
					accessRole: USER_ROLE.SUPERVISOR,
				},
			}),
		])

		// Top 5 usuarios por órdenes de trabajo
		const topUsersByWorkOrders = await prisma.user.findMany({
			take: 5,
			select: {
				name: true,
				workOrders: {
					select: {
						status: true,
					},
				},
			},
			orderBy: {
				workOrders: {
					_count: "desc",
				},
			},
		})

		const formattedTopUsers = topUsersByWorkOrders.map((user) => ({
			name: user.name,
			workOrders: {
				PENDING: user.workOrders.filter((wo) => wo.status === "PENDING").length,
				PLANNED: user.workOrders.filter((wo) => wo.status === "PLANNED").length,
				IN_PROGRESS: user.workOrders.filter((wo) => wo.status === "IN_PROGRESS").length,
				COMPLETED: user.workOrders.filter((wo) => wo.status === "COMPLETED").length,
				CANCELLED: user.workOrders.filter((wo) => wo.status === "CANCELLED").length,
				CLOSURE_REQUESTED: user.workOrders.filter((wo) => wo.status === "CLOSURE_REQUESTED").length,
			},
		}))

		// Actividad de documentos por día (últimos 30 días)
		const thirtyDaysAgo = new Date()
		thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

		const userDocumentActivity = await prisma.user.findMany({
			select: {
				name: true,
				folders: {
					where: {
						createdAt: {
							gte: thirtyDaysAgo,
						},
					},
					select: {
						createdAt: true,
						files: true,
					},
				},
			},
		})

		// Procesar datos de actividad por día
		const documentActivity = userDocumentActivity.map((user) => {
			const dailyActivity: Record<string, number> = {}

			// Contar documentos por día
			user.folders.forEach((folder) => {
				folder.files.forEach((file) => {
					const date = format(file.createdAt, "MM-dd")
					dailyActivity[date] = (dailyActivity[date] || 0) + 1
				})
			})

			return {
				name: user.name,
				activity: Object.entries(dailyActivity).map(([date, documents]) => ({
					date,
					documents,
				})),
			}
		})

		return NextResponse.json({
			basicStats: {
				totalUsers,
				twoFactorEnabled,
				totalContractors,
				totalSupervisors,
			},
			charts: {
				topUsersByWorkOrders: formattedTopUsers,
				documentActivity,
			},
		})
	} catch (error) {
		console.error("[USERS_STATS_ERROR]", error)
		return NextResponse.json(
			{
				basicStats: {
					totalUsers: 0,
					twoFactorEnabled: 0,
					totalContractors: 0,
					totalSupervisors: 0,
				},
				charts: {
					topUsersByWorkOrders: [],
					documentActivity: [],
				},
			},
			{ status: 500 }
		)
	}
}
