import { type NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET(req: NextRequest) {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		})

		if (!session?.user) {
			return NextResponse.json({ error: "No autorizado" }, { status: 401 })
		}

		const searchParams = req.nextUrl.searchParams
		const page = parseInt(searchParams.get("page") || "1")
		const limit = parseInt(searchParams.get("limit") || "10")
		const search = searchParams.get("search") || ""

		const skip = (page - 1) * limit

		const [safetyTalks, total] = await Promise.all([
			prisma.userSafetyTalk.findMany({
				select: {
					id: true,
					category: true,
					status: true,
					score: true,
					completedAt: true,
					expiresAt: true,
					currentAttempts: true,
					user: {
						select: {
							id: true,
							name: true,
							email: true,
							rut: true,
							company: {
								select: {
									id: true,
									name: true,
								},
							},
						},
					},
				},
				orderBy: {
					completedAt: "desc",
				},
				skip,
				take: limit,
			}),
			prisma.userSafetyTalk.count({
				where: {
					user: {
						name: {
							contains: search,
							mode: "insensitive" as const,
						},
					},
				},
			}),
		])

		return NextResponse.json({
			data: safetyTalks,
			total,
			pages: Math.ceil(total / limit),
		})
	} catch (error) {
		console.error("[SAFETY_TALKS_TABLE]", error)
		return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
	}
}
