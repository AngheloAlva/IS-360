import { NextRequest, NextResponse } from "next/server"

import prisma from "@/lib/prisma"

export async function GET(req: NextRequest) {
	try {
		const searchParams = req.nextUrl.searchParams
		const page = parseInt(searchParams.get("page") || "1")
		const limit = parseInt(searchParams.get("limit") || "10")
		const search = searchParams.get("search") || ""

		const skip = (page - 1) * limit

		const [companies, total] = await Promise.all([
			prisma.company.findMany({
				where: {
					...(search
						? {
								OR: [
									{ name: { contains: search, mode: "insensitive" as const } },
									{ rut: { contains: search, mode: "insensitive" as const } },
								],
							}
						: {}),
				},
				select: {
					id: true,
					name: true,
					rut: true,
					users: {
						where: {
							isSupervisor: true,
						},
						select: {
							name: true,
						},
					},
					createdAt: true,
				},
				orderBy: {
					createdAt: "desc",
				},
				skip,
				take: limit,
			}),
			prisma.company.count({
				where: {
					...(search
						? {
								OR: [
									{ name: { contains: search, mode: "insensitive" as const } },
									{ rut: { contains: search, mode: "insensitive" as const } },
								],
							}
						: {}),
				},
			}),
		])

		return NextResponse.json({ companies, total, pages: Math.ceil(total / limit) })
	} catch (error) {
		console.error("Error fetching companies:", error)
		return NextResponse.json({ error: "Error fetching companies" }, { status: 500 })
	}
}
