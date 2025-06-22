import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"

import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(req: NextRequest): Promise<NextResponse> {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return new NextResponse("No autorizado", { status: 401 })
	}

	try {
		const searchParams = req.nextUrl.searchParams
		const page = parseInt(searchParams.get("page") ?? "1")
		const limit = parseInt(searchParams.get("limit") ?? "10")
		const search = searchParams.get("search") ?? ""

		const skip = (page - 1) * limit

		const [safetyTalks, total] = await Promise.all([
			prisma.safetyTalk.findMany({
				where: search
					? {
							OR: [
								{ title: { contains: search, mode: "insensitive" } },
								{ description: { contains: search, mode: "insensitive" } },
							],
						}
					: {},
				skip,
				take: limit,
				orderBy: { createdAt: "desc" },
				include: {
					_count: {
						select: {
							questions: true,
							resources: true,
							userSafetyTalks: true,
						},
					},
				},
				cacheStrategy: {
					ttl: 120,
					swr: 10,
				},
			}),
			prisma.safetyTalk.count({
				where: search
					? {
							OR: [
								{ title: { contains: search, mode: "insensitive" } },
								{ description: { contains: search, mode: "insensitive" } },
							],
						}
					: {},
				cacheStrategy: {
					ttl: 120,
					swr: 10,
				},
			}),
		])

		return NextResponse.json({ data: safetyTalks, total, pages: Math.ceil(total / limit) }, { status: 200 })
	} catch (error) {
		console.error("[SAFETY_TALKS_GET]", error)
		return NextResponse.json({ error: "Internal server error" }, { status: 500 })
	}
}
