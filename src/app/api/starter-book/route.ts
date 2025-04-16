import { NextRequest } from "next/server"

import prisma from "@/lib/prisma"

export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams
		const page = parseInt(searchParams.get("page") ?? "1")
		const limit = parseInt(searchParams.get("limit") ?? "10")
		const search = searchParams.get("search") ?? ""

		const skip = (page - 1) * limit

		const [starterBooks, total] = await Promise.all([
			prisma.starterBook.findMany({
				where: search
					? {
							OR: [
								{
									company: {
										name: {
											contains: search,
											mode: "insensitive",
										},
									},
								},
							],
						}
					: {},
				skip,
				take: limit,
				include: {
					company: {
						select: {
							id: true,
							name: true,
						},
					},
				},
				orderBy: { createdAt: "desc" },
				cacheStrategy: {
					ttl: 120,
					swr: 10,
				},
			}),
			prisma.starterBook.count({
				where: search
					? {
							OR: [
								{
									company: {
										name: {
											contains: search,
											mode: "insensitive",
										},
									},
								},
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
			total,
			starterBooks,
			pages: Math.ceil(total / limit),
		})
	} catch (error) {
		console.error("[STARTER_BOOK_GET]", error)
		return new Response("Internal Error", { status: 500 })
	}
}
