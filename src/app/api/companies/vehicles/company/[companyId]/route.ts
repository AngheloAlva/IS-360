import { NextRequest, NextResponse } from "next/server"

import prisma from "@/lib/prisma"

export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ companyId: string }> }
) {
	try {
		const companyId = (await params).companyId
		const searchParams = req.nextUrl.searchParams

		const page = parseInt(searchParams.get("page") || "1")
		const limit = parseInt(searchParams.get("limit") || "10")
		const search = searchParams.get("search") || ""

		const skip = (page - 1) * limit

		const [vehicles, total] = await Promise.all([
			prisma.vehicle.findMany({
				where: {
					companyId,
					...(search
						? {
								OR: [
									{ model: { contains: search, mode: "insensitive" as const } },
									{ plate: { contains: search, mode: "insensitive" as const } },
									{ brand: { contains: search, mode: "insensitive" as const } },
								],
							}
						: {}),
				},
				select: {
					id: true,
					year: true,
					type: true,
					model: true,
					plate: true,
					brand: true,
					color: true,
					isMain: true,
				},
				skip,
				take: limit,
				orderBy: {
					createdAt: "desc",
				},
			}),
			prisma.vehicle.count({
				where: {
					companyId,
					...(search
						? {
								OR: [
									{ model: { contains: search, mode: "insensitive" as const } },
									{ plate: { contains: search, mode: "insensitive" as const } },
									{ brand: { contains: search, mode: "insensitive" as const } },
								],
							}
						: {}),
				},
			}),
		])

		return NextResponse.json({
			total,
			vehicles,
			pages: Math.ceil(total / limit),
		})
	} catch (error) {
		console.error("[VEHICLES_GET]", error)
		return NextResponse.json({ error: "Error fetching vehicles" }, { status: 500 })
	}
}
