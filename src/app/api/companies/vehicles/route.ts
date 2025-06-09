import { NextRequest, NextResponse } from "next/server"

import prisma from "@/lib/prisma"

export async function GET(req: NextRequest) {
	try {
		const searchParams = req.nextUrl.searchParams
		const page = parseInt(searchParams.get("page") || "1")
		const limit = parseInt(searchParams.get("limit") || "10")
		const search = searchParams.get("search") || ""

		const skip = (page - 1) * limit

		const [vehicles, total] = await Promise.all([
			prisma.vehicle.findMany({
				where: {
					...(search
						? {
								OR: [
									{ model: { contains: search, mode: "insensitive" as const } },
									{ plate: { contains: search, mode: "insensitive" as const } },
									{ company: { name: { contains: search, mode: "insensitive" as const } } },
								],
							}
						: {}),
				},
				select: {
					id: true,
					year: true,
					model: true,
					plate: true,
					brand: true,
					type: true,
					isMain: true,
					company: {
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
					swr: 10,
				},
			}),
			prisma.vehicle.count({
				where: {
					...(search
						? {
								OR: [
									{ model: { contains: search, mode: "insensitive" as const } },
									{ plate: { contains: search, mode: "insensitive" as const } },
									{ company: { name: { contains: search, mode: "insensitive" as const } } },
								],
							}
						: {}),
				},
				cacheStrategy: {
					ttl: 10,
					swr: 10,
				},
			}),
		])

		return NextResponse.json({ vehicles, total, pages: Math.ceil(total / limit) })
	} catch (error) {
		console.error("Error fetching companies:", error)
		return NextResponse.json({ error: "Error fetching companies" }, { status: 500 })
	}
}
