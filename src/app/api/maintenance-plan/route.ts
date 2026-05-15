import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { addWeeks } from "date-fns"

import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

import type { Order, OrderBy } from "@/shared/components/OrderByButton"

const ALLOWED_SORT_FIELDS: OrderBy[] = ["name", "createdAt"]
const ALLOWED_ALERT_FILTERS = ["all", "withOverdue", "withUpcoming", "withAlerts", "withoutAlerts"]
type AlertFilter = (typeof ALLOWED_ALERT_FILTERS)[number]

export async function GET(request: NextRequest): Promise<NextResponse> {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return new NextResponse("No autorizado", { status: 401 })
	}

	const searchParams = request.nextUrl.searchParams
	const limit = parseInt(searchParams.get("limit") ?? "10")
	const page = parseInt(searchParams.get("page") ?? "1")
	const search = searchParams.get("search") ?? ""
	const includeTasks = searchParams.get("includeTasks") === "true"
	const requestedAlertFilter = searchParams.get("alertFilter") as AlertFilter | null
	const requestedOrder = searchParams.get("order") as Order | null
	const requestedOrderBy = searchParams.get("orderBy") as OrderBy | null
	const alertFilter: AlertFilter =
		requestedAlertFilter && ALLOWED_ALERT_FILTERS.includes(requestedAlertFilter)
			? requestedAlertFilter
			: "all"
	const order: Order = requestedOrder === "desc" ? "desc" : "asc"
	const orderBy: OrderBy =
		requestedOrderBy && ALLOWED_SORT_FIELDS.includes(requestedOrderBy) ? requestedOrderBy : "name"

	const skip = (page - 1) * limit
	const today = new Date()
	const nextWeek = addWeeks(today, 1)

	const where = {
		isActive: true,
		...(search
			? {
					OR: [
						{ name: { contains: search, mode: "insensitive" as const } },
						{ description: { contains: search, mode: "insensitive" as const } },
						{ equipment: { name: { contains: search, mode: "insensitive" as const } } },
						{
							task: {
								some: {
									equipments: {
										some: {
											name: { contains: search, mode: "insensitive" as const },
										},
									},
								},
							},
						},
					],
				}
			: {}),
		...(alertFilter === "withOverdue"
			? {
					task: {
						some: {
							isActive: true,
							nextDate: {
								lt: today,
							},
						},
					},
				}
			: {}),
		...(alertFilter === "withUpcoming"
			? {
					task: {
						some: {
							isActive: true,
							nextDate: {
								gte: today,
								lte: nextWeek,
							},
						},
					},
				}
			: {}),
		...(alertFilter === "withAlerts"
			? {
					task: {
						some: {
							isActive: true,
							nextDate: {
								lte: nextWeek,
							},
						},
					},
				}
			: {}),
		...(alertFilter === "withoutAlerts"
			? {
					NOT: {
						task: {
							some: {
								isActive: true,
								nextDate: {
									lte: nextWeek,
								},
							},
						},
					},
				}
			: {}),
	}

	try {
		const [maintenancePlans, total] = await Promise.all([
			await prisma.maintenancePlan.findMany({
				where,
				skip,
				select: {
					id: true,
					name: true,
					slug: true,
					createdAt: true,
					createdBy: {
						select: {
							id: true,
							name: true,
						},
					},
					equipment: {
						select: {
							id: true,
							tag: true,
							name: true,
							location: { select: { id: true, name: true, path: true } },
						},
					},
					task: includeTasks
						? {
								where: {
									isActive: true,
								},
								select: {
									id: true,
									name: true,
									nextDate: true,
									equipment: {
										select: {
											id: true,
											name: true,
										},
									},
									equipments: {
										select: {
											id: true,
											name: true,
											location: { select: { id: true, name: true, path: true } },
										},
									},
								},
							}
						: false,
				},
				take: limit,
				orderBy: { [orderBy]: order },
			}),
			await prisma.maintenancePlan.count({
				where,
			}),
		])

		const planIds = maintenancePlans.map((plan) => plan.id)

		const [nextWeekCounts, expiredCounts] = await Promise.all([
			prisma.maintenancePlanTask.groupBy({
				by: ["maintenancePlanId"],
				where: {
					isActive: true,
					maintenancePlanId: {
						in: planIds,
					},
					nextDate: {
						gte: today,
						lte: nextWeek,
					},
				},
				_count: {
					_all: true,
				},
			}),
			prisma.maintenancePlanTask.groupBy({
				by: ["maintenancePlanId"],
				where: {
					isActive: true,
					maintenancePlanId: {
						in: planIds,
					},
					nextDate: {
						lt: today,
					},
				},
				_count: {
					_all: true,
				},
			}),
		])

		const nextWeekCountsByPlan = new Map(
			nextWeekCounts.map((item) => [item.maintenancePlanId, item._count._all])
		)
		const expiredCountsByPlan = new Map(
			expiredCounts.map((item) => [item.maintenancePlanId, item._count._all])
		)

		const plansWithCounts = maintenancePlans.map((plan) => ({
			...plan,
			task: plan.task
				? plan.task.map((task) => {
						const normalizedTask = task as typeof task & {
							equipment: { id: string; name: string; location: string } | null
							equipments: { id: string; name: string; location: string }[]
						}
						const normalizedEquipments =
							normalizedTask.equipments.length > 0
								? normalizedTask.equipments
								: normalizedTask.equipment
									? [normalizedTask.equipment]
									: []
						const primaryEquipment = normalizedEquipments[0] ?? normalizedTask.equipment

						return {
							...normalizedTask,
							equipments: normalizedEquipments,
							equipment: primaryEquipment,
						}
					})
				: plan.task,
			nextWeekTasksCount: nextWeekCountsByPlan.get(plan.id) ?? 0,
			expiredTasksCount: expiredCountsByPlan.get(plan.id) ?? 0,
		}))

		return NextResponse.json({
			total,
			maintenancePlans: plansWithCounts,
			pages: Math.ceil(total / limit),
		})
	} catch (error) {
		console.error("[MAINTENANCE_PLAN_GET]", error)
		return NextResponse.json({
			message: "Internal Error",
			status: 500,
		})
	}
}
