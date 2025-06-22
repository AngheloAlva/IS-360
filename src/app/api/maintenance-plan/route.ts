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
	const nextWeek = addWeeks(new Date(), 1)

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
					_count: {
						select: {
							task: {
								where: {
									nextDate: {
										lte: nextWeek,
										gte: new Date(),
									},
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

		return NextResponse.json({
			total,
			maintenancePlans,
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
