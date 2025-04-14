import { NextRequest } from "next/server"

import prisma from "@/lib/prisma"

export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams
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

		return Response.json({
			safetyTalks,
			total,
			pages: Math.ceil(total / limit),
		})
	} catch (error) {
		console.error("[SAFETY_TALKS_GET]", error)
		return new Response("Internal Error", { status: 500 })
	}
}
