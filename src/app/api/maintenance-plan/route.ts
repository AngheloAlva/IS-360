import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { addWeeks } from "date-fns"
import { MAINTENANCE_PLAN_LOCATION } from "@prisma/client"

import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

import type { Order, OrderBy } from "@/shared/components/OrderByButton"

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
	const location = searchParams.get("location") ?? ""
	const order = searchParams.get("order") as Order
	const orderBy = searchParams.get("orderBy") as OrderBy

	const skip = (page - 1) * limit
	const today = new Date()
	const nextWeek = addWeeks(today, 1)

	try {
		const [maintenancePlans, total] = await Promise.all([
			await prisma.maintenancePlan.findMany({
				where: {
					...(search
						? {
								OR: [
									{ name: { contains: search, mode: "insensitive" } },
									{ description: { contains: search, mode: "insensitive" } },
									{ equipment: { name: { contains: search, mode: "insensitive" } } },
								],
							}
						: {}),
					...(location ? { location: location as MAINTENANCE_PLAN_LOCATION } : {}),
				},
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
							location: true,
						},
					},
					task: {
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
						},
					},
				},
				take: limit,
				orderBy: { [orderBy]: order },
				cacheStrategy: {
					ttl: 10,
				},
			}),
			await prisma.maintenancePlan.count({
				where: {
					...(search
						? {
								OR: [
									{ name: { contains: search, mode: "insensitive" } },
									{ description: { contains: search, mode: "insensitive" } },
									{ equipment: { name: { contains: search, mode: "insensitive" } } },
								],
							}
						: {}),
					...(location ? { location: location as MAINTENANCE_PLAN_LOCATION } : {}),
				},
				cacheStrategy: {
					ttl: 10,
				},
			}),
		])

		// Get counts for next week tasks and expired tasks
		const plansWithCounts = await Promise.all(
			maintenancePlans.map(async (plan) => {
				const [nextWeekTasks, expiredTasks] = await Promise.all([
					prisma.maintenancePlanTask.count({
						where: {
							maintenancePlanId: plan.id,
							nextDate: {
								lte: nextWeek,
								gte: today,
							},
						},
					}),
					prisma.maintenancePlanTask.count({
						where: {
							maintenancePlanId: plan.id,
							nextDate: {
								lt: today,
							},
						},
					}),
				])

				return {
					...plan,
					nextWeekTasksCount: nextWeekTasks,
					expiredTasksCount: expiredTasks,
				}
			})
		)

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
