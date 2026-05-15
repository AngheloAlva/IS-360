import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { addDays, differenceInCalendarDays, subDays } from "date-fns"

import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

const WORK_ORDER_ACTIVE_STATUSES = [
	"PLANNED",
	"PENDING",
	"IN_PROGRESS",
	"CLOSURE_REQUESTED",
] as const

export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ planSlug: string }> }
): Promise<NextResponse> {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return new NextResponse("No autorizado", { status: 401 })
	}

	const { planSlug } = await params

	try {
		const maintenancePlan = await prisma.maintenancePlan.findFirst({
			where: {
				slug: planSlug,
				isActive: true,
			},
			select: {
				id: true,
			},
		})

		if (!maintenancePlan) {
			return NextResponse.json({
				message: "Plan de mantenimiento no encontrado",
				status: 404,
			})
		}

		const completedWorkOrders = await prisma.workOrder.findMany({
			where: {
				deletedAt: null,
				MaintenancePlanTask: {
					maintenancePlanId: maintenancePlan.id,
					isActive: true,
				},
				status: "COMPLETED",
				endDate: {
					not: null,
				},
			},
			select: {
				endDate: true,
			},
			orderBy: {
				endDate: "asc",
			},
		})

		const monthsMap = new Map<string, number>()

		completedWorkOrders.forEach((wo) => {
			if (!wo.endDate) return
			const date = new Date(wo.endDate)

			const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
			monthsMap.set(key, (monthsMap.get(key) || 0) + 1)
		})

		const stats = Array.from(monthsMap.entries())
			.map(([date, count]) => {
				const [year, month] = date.split("-")
				const dateObj = new Date(parseInt(year), parseInt(month) - 1)

				const name = dateObj.toLocaleDateString("es-ES", { month: "long", year: "numeric" })

				const formattedName = name.charAt(0).toUpperCase() + name.slice(1)

				return {
					name: formattedName,
					date: date,
					value: count,
				}
			})
			.sort((a, b) => a.date.localeCompare(b.date))

		const now = new Date()
		const thirtyDaysAgo = subDays(now, 30)

		const [
			totalTasks,
			overdueTasks,
			tasksNext7Days,
			totalWorkOrdersLast30Days,
			completedWorkOrdersLast30Days,
			overdueTasksWithoutActiveOrder,
			riskTasks,
		] = await Promise.all([
			prisma.maintenancePlanTask.count({
				where: {
					maintenancePlanId: maintenancePlan.id,
					isActive: true,
				},
			}),
			prisma.maintenancePlanTask.count({
				where: {
					maintenancePlanId: maintenancePlan.id,
					isActive: true,
					nextDate: {
						lt: now,
					},
				},
			}),
			prisma.maintenancePlanTask.count({
				where: {
					maintenancePlanId: maintenancePlan.id,
					isActive: true,
					nextDate: {
						gte: now,
						lte: addDays(now, 7),
					},
				},
			}),
			prisma.workOrder.count({
				where: {
					deletedAt: null,
					maintenancePlanTaskId: {
						not: null,
					},
					MaintenancePlanTask: {
						maintenancePlanId: maintenancePlan.id,
						isActive: true,
					},
					createdAt: {
						gte: thirtyDaysAgo,
					},
				},
			}),
			prisma.workOrder.count({
				where: {
					deletedAt: null,
					maintenancePlanTaskId: {
						not: null,
					},
					MaintenancePlanTask: {
						maintenancePlanId: maintenancePlan.id,
						isActive: true,
					},
					createdAt: {
						gte: thirtyDaysAgo,
					},
					status: "COMPLETED",
				},
			}),
			prisma.maintenancePlanTask.count({
				where: {
					maintenancePlanId: maintenancePlan.id,
					isActive: true,
					nextDate: {
						lt: now,
					},
					workOrders: {
						none: {
							status: {
								in: [...WORK_ORDER_ACTIVE_STATUSES],
							},
						},
					},
				},
			}),
			prisma.maintenancePlanTask.findMany({
				where: {
					maintenancePlanId: maintenancePlan.id,
					isActive: true,
					nextDate: {
						lt: now,
					},
					workOrders: {
						none: {
							status: {
								in: [...WORK_ORDER_ACTIVE_STATUSES],
							},
						},
					},
				},
				select: {
					id: true,
					name: true,
					nextDate: true,
					equipment: {
						select: {
							name: true,
							location: { select: { id: true, name: true, path: true } },
						},
					},
					equipments: {
						select: {
							name: true,
							location: { select: { id: true, name: true, path: true } },
						},
					},
					_count: {
						select: {
							workOrders: true,
						},
					},
				},
				orderBy: {
					nextDate: "asc",
				},
				take: 5,
			}),
		])

		const planHealthScore =
			totalTasks === 0
				? 100
				: Math.max(0, Math.round(((totalTasks - overdueTasks) / totalTasks) * 100))

		const completionRateLast30Days =
			totalWorkOrdersLast30Days === 0
				? 0
				: Math.round((completedWorkOrdersLast30Days / totalWorkOrdersLast30Days) * 100)

		const overdueWithoutActiveRatio =
			totalTasks === 0 ? 0 : overdueTasksWithoutActiveOrder / totalTasks

		const operationalRiskLevel =
			overdueWithoutActiveRatio >= 0.35
				? "high"
				: overdueWithoutActiveRatio >= 0.15
					? "medium"
					: "low"

		return NextResponse.json({
			monthlyStats: stats,
			health: {
				totalTasks,
				overdueTasks,
				tasksNext7Days,
				planHealthScore,
				completionRateLast30Days,
				totalWorkOrdersLast30Days,
				completedWorkOrdersLast30Days,
			},
			risk: {
				level: operationalRiskLevel,
				overdueTasksWithoutActiveOrder,
				tasks: riskTasks.map((riskTask) => {
					const normalizedEquipments =
						riskTask.equipments.length > 0
							? riskTask.equipments
							: riskTask.equipment
								? [riskTask.equipment]
								: []

					return {
						id: riskTask.id,
						name: riskTask.name,
						nextDate: riskTask.nextDate,
						daysOverdue: Math.max(0, differenceInCalendarDays(now, new Date(riskTask.nextDate))),
						equipmentName: normalizedEquipments.map((equipment) => equipment.name).join(", "),
						equipmentLocation: normalizedEquipments
							.map((equipment) => equipment.location?.path ?? "")
							.join(", "),
						workOrdersCount: riskTask._count.workOrders,
					}
				}),
			},
		})
	} catch (error) {
		console.error("[MAINTENANCE_PLAN_STATS_GET]", error)
		return NextResponse.json({
			message: "Internal Error",
			status: 500,
		})
	}
}
