import { NextRequest, NextResponse } from "next/server"

import prisma from "@/lib/prisma"

export async function GET(request: NextRequest) {
	const searchParams = request.nextUrl.searchParams
	const limit = parseInt(searchParams.get("limit") ?? "10")
	const page = parseInt(searchParams.get("page") ?? "1")
	const search = searchParams.get("search") ?? ""

	const skip = (page - 1) * limit

	try {
		const [maintenancePlans, total] = await Promise.all([
			await prisma.maintenancePlan.findMany({
				where: search
					? {
							name: { contains: search, mode: "insensitive" },
							description: { contains: search, mode: "insensitive" },
							equipment: { name: { contains: search, mode: "insensitive" } },
						}
					: {},
				skip,
				select: {
					id: true,
					name: true,
					slug: true,
					description: true,
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
							task: true,
						},
					},
				},
				take: limit,
				orderBy: { createdAt: "desc" },
				cacheStrategy: {
					ttl: 120,
					swr: 10,
				},
			}),
			await prisma.maintenancePlan.count({
				where: search
					? {
							name: { contains: search, mode: "insensitive" },
							description: { contains: search, mode: "insensitive" },
							equipment: { name: { contains: search, mode: "insensitive" } },
						}
					: {},
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
