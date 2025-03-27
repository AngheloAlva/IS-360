import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

import type { User } from "@prisma/client"

export async function GET(req: NextRequest) {
	try {
		const searchParams = req.nextUrl.searchParams
		const page = parseInt(searchParams.get("page") || "1")
		const limit = parseInt(searchParams.get("limit") || "10")
		const search = searchParams.get("search") || ""
		const role = searchParams.get("role")

		const skip = (page - 1) * limit

		const where = {
			...(search
				? {
						OR: [
							{ name: { contains: search, mode: "insensitive" as const } },
							{ email: { contains: search, mode: "insensitive" as const } },
							{ rut: { contains: search, mode: "insensitive" as const } },
						],
					}
				: {}),
			...(role ? { role: role as User["role"] } : {}),
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
					email: true,
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
			}),
			prisma.user.count({ where }),
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
