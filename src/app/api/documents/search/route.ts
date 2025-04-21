import { NextRequest, NextResponse } from "next/server"

import prisma from "@/lib/prisma"

export async function GET(req: NextRequest) {
	try {
		const searchParams = req.nextUrl.searchParams
		const page = parseInt(searchParams.get("page") || "1")
		const limit = parseInt(searchParams.get("limit") || "15")
		const search = searchParams.get("search") || ""

		const skip = (page - 1) * limit

		const files = await prisma.file.findMany({
			where: {
				...(search
					? {
							OR: [
								{ name: { contains: search, mode: "insensitive" as const } },
								{ description: { contains: search, mode: "insensitive" as const } },
							],
						}
					: {}),
				isActive: true,
			},
			include: {
				user: {
					select: {
						name: true,
					},
				},
			},
			orderBy: {
				createdAt: "desc",
			},
			skip,
			take: limit,
			cacheStrategy: {
				ttl: 60,
				swr: 10,
			},
		})

		return NextResponse.json({
			files,
		})
	} catch (error) {
		console.error("[SEARCH_FILES_GET]", error)
		return new NextResponse("Internal Error", { status: 500 })
	}
}
