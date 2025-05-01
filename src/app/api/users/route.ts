import { NextRequest, NextResponse } from "next/server"

import { USER_ROLE } from "@prisma/client"
import prisma from "@/lib/prisma"

export async function GET(req: NextRequest) {
	try {
		const searchParams = req.nextUrl.searchParams
		const page = parseInt(searchParams.get("page") || "1")
		const limit = parseInt(searchParams.get("limit") || "10")
		const search = searchParams.get("search") || ""

		const skip = (page - 1) * limit

		const where = {
			role: { in: [USER_ROLE.ADMIN, USER_ROLE.USER] },
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
					email: true,
					modules: true,
					createdAt: true,
					internalRole: true,
					isSupervisor: true,
					company: {
						select: {
							name: true,
						},
					},
				},
				skip,
				take: limit,
				orderBy: {
					createdAt: "desc",
				},
				cacheStrategy: {
					ttl: 60,
					swr: 10,
				},
			}),
			prisma.user.count({
				where,
				cacheStrategy: {
					ttl: 60,
					swr: 10,
				},
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
