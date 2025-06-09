import { NextRequest, NextResponse } from "next/server"

import prisma from "@/lib/prisma"

export async function GET(req: NextRequest) {
	try {
		const searchParams = req.nextUrl.searchParams
		const page = parseInt(searchParams.get("page") || "1")
		const limit = parseInt(searchParams.get("limit") || "15")
		const search = searchParams.get("search") || ""
		const expiration = searchParams.get("expiration") || "all"

		const skip = (page - 1) * limit

		const today = new Date()
		const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
		const next15Days = new Date(today.getTime() + 15 * 24 * 60 * 60 * 1000)
		const next30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
		const next60Days = new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000)
		const next90Days = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000)

		let expirationFilter = {}

		switch (expiration) {
			case "vencido":
				expirationFilter = {
					expirationDate: {
						lt: today,
					},
				}
				break
			case "vence-esta-semana":
				expirationFilter = {
					expirationDate: {
						gte: today,
						lt: nextWeek,
					},
				}
				break
			case "vence-en-8-15-dias":
				expirationFilter = {
					expirationDate: {
						gte: nextWeek,
						lt: next15Days,
					},
				}
				break
			case "vence-en-16-30-dias":
				expirationFilter = {
					expirationDate: {
						gte: next15Days,
						lt: next30Days,
					},
				}
				break
			case "vence-en-31-60-dias":
				expirationFilter = {
					expirationDate: {
						gte: next30Days,
						lt: next60Days,
					},
				}
				break
			case "vence-en-61-90-dias":
				expirationFilter = {
					expirationDate: {
						gte: next60Days,
						lt: next90Days,
					},
				}
				break
			case "vence-despues-de-90-dias":
				expirationFilter = {
					expirationDate: {
						gte: next90Days,
					},
				}
				break
			default:
				expirationFilter = {}
		}

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
				...expirationFilter,
				isActive: true,
				isExternal: false,
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
				ttl: 10,
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
