import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"

import { ACCESS_ROLE, AREAS } from "@/generated/prisma/enums"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

import type { Order, OrderBy } from "@/shared/components/OrderByButton"

const ALLOWED_SORT_FIELDS = ["name", "email", "rut", "area", "internalRole", "createdAt"] as const
type UserSortBy = (typeof ALLOWED_SORT_FIELDS)[number]

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
		const area = searchParams.get("area") || "all"
		const requestedOrderBy = searchParams.get("orderBy") as OrderBy | null
		const requestedOrder = searchParams.get("order") as Order | null
		const orderBy: UserSortBy =
			requestedOrderBy && ALLOWED_SORT_FIELDS.includes(requestedOrderBy as UserSortBy)
				? (requestedOrderBy as UserSortBy)
				: "createdAt"
		const order: Order = requestedOrder === "desc" ? "desc" : "asc"

		const skip = (page - 1) * limit

		const where = {
			accessRole: ACCESS_ROLE.ADMIN,
			isActive: true,
			...(area !== "all" ? { area: area as AREAS } : {}),
			...(search
				? {
						OR: [
							{ name: { contains: search, mode: "insensitive" as const } },
							{ email: { contains: search, mode: "insensitive" as const } },
							{ rut: { contains: search, mode: "insensitive" as const } },
						],
					}
				: {}),
		}

		const [users, total] = await Promise.all([
			prisma.user.findMany({
				where,
				select: {
					id: true,
					rut: true,
					name: true,
					role: true,
					area: true,
					phone: true,
					image: true,
					email: true,
					createdAt: true,
					internalRole: true,
					isSupervisor: true,
					documentAreas: true,
					allowedModules: true,
					allowedCompanies: true,
					company: {
						select: {
							name: true,
						},
					},
				},
				skip,
				take: limit,
				orderBy: {
					[orderBy]: order,
				},
			}),
			prisma.user.count({
				where,
			}),
		])

		return NextResponse.json({
			users,
			total,
			pages: Math.ceil(total / limit),
		})
	} catch (error) {
		console.error("[USERS_GET]", error)
		return new NextResponse("Internal Error", { status: 500 })
	}
}
