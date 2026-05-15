import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"

import { VEHICLE_TYPE } from "@/generated/prisma/enums"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

const ALLOWED_SORT_FIELDS = [
	"plate",
	"model",
	"year",
	"brand",
	"type",
	"isMain",
	"createdAt",
] as const
type VehicleSortBy = (typeof ALLOWED_SORT_FIELDS)[number]
type SortOrder = "asc" | "desc"

export async function GET(req: NextRequest): Promise<NextResponse> {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return new NextResponse("No autorizado", { status: 401 })
	}

	try {
		const searchParams = req.nextUrl.searchParams

		const page = parseInt(searchParams.get("page") || "1")
		const limit = parseInt(searchParams.get("limit") || "10")
		const search = searchParams.get("search") || ""
		const companyId = searchParams.get("companyId") as string
		const typeFilter = searchParams.get("typeFilter")
		const requestedSortBy = searchParams.get("sortBy") as VehicleSortBy | null
		const requestedSortOrder = searchParams.get("sortOrder") as SortOrder | null

		const sortBy: VehicleSortBy =
			requestedSortBy && ALLOWED_SORT_FIELDS.includes(requestedSortBy)
				? requestedSortBy
				: "createdAt"
		const sortOrder: SortOrder = requestedSortOrder === "asc" ? "asc" : "desc"

		const skip = (page - 1) * limit

		const where = {
			isActive: true,
			companyId,
			...(typeFilter ? { type: typeFilter as VEHICLE_TYPE } : {}),
			...(search
				? {
						OR: [
							{ model: { contains: search, mode: "insensitive" as const } },
							{ plate: { contains: search, mode: "insensitive" as const } },
							{ brand: { contains: search, mode: "insensitive" as const } },
						],
					}
				: {}),
		}

		const [vehicles, total] = await Promise.all([
			prisma.vehicle.findMany({
				where,
				select: {
					id: true,
					year: true,
					type: true,
					model: true,
					plate: true,
					brand: true,
					color: true,
					isMain: true,
					createdAt: true,
					companyId: true,
				},
				skip,
				take: limit,
				orderBy: {
					[sortBy]: sortOrder,
				},
			}),
			prisma.vehicle.count({
				where,
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
