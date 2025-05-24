import { NextRequest, NextResponse } from "next/server"
import { addWeeks } from "date-fns"
import { MAINTENANCE_PLAN_LOCATION } from "@prisma/client"

import prisma from "@/lib/prisma"

export async function GET(request: NextRequest) {
	const searchParams = request.nextUrl.searchParams
	const limit = parseInt(searchParams.get("limit") ?? "10")
	const page = parseInt(searchParams.get("page") ?? "1")
	const search = searchParams.get("search") ?? ""
	const location = searchParams.get("location") ?? ""

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
					...(location
						? { location: location as MAINTENANCE_PLAN_LOCATION }
						: {}),
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
							tag: true,
							name: true,
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
				orderBy: { createdAt: "asc" },
				cacheStrategy: {
					ttl: 120,
					swr: 10,
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
					...(location
						? { location: location as MAINTENANCE_PLAN_LOCATION }
						: {}),
				},
				cacheStrategy: {
					ttl: 120,
					swr: 10,
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
