import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"

import { ACCESS_ROLE } from "@prisma/client"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

import type { Order, OrderBy } from "@/shared/components/OrderByButton"

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
		const orderBy = searchParams.get("orderBy") as OrderBy
		const order = searchParams.get("order") as Order

		const skip = (page - 1) * limit

		const where = {
			accessRole: ACCESS_ROLE.ADMIN,
			isActive: true,
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
