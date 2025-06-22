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

		const page = parseInt(searchParams.get("page") || "1")
		const limit = parseInt(searchParams.get("limit") || "10")
		const search = searchParams.get("search") || ""
		const companyId = searchParams.get("companyId") as string

		const skip = (page - 1) * limit

		const [vehicles, total] = await Promise.all([
			prisma.vehicle.findMany({
				where: {
					isActive: true,
					companyId,
					...(search
						? {
								OR: [
									{ model: { contains: search, mode: "insensitive" as const } },
									{ plate: { contains: search, mode: "insensitive" as const } },
									{ brand: { contains: search, mode: "insensitive" as const } },
								],
							}
						: {}),
				},
				select: {
					id: true,
					year: true,
					type: true,
					model: true,
					plate: true,
					brand: true,
					color: true,
					isMain: true,
					createdAt: true,
					companyId: true,
				},
				skip,
				take: limit,
				orderBy: {
					createdAt: "desc",
				},
			}),
			prisma.vehicle.count({
				where: {
					companyId,
					...(search
						? {
								OR: [
									{ model: { contains: search, mode: "insensitive" as const } },
									{ plate: { contains: search, mode: "insensitive" as const } },
									{ brand: { contains: search, mode: "insensitive" as const } },
								],
							}
						: {}),
				},
			}),
		])

		return NextResponse.json({
			total,
			vehicles,
			pages: Math.ceil(total / limit),
		})
	} catch (error) {
		console.error("[VEHICLES_GET]", error)
		return NextResponse.json({ error: "Error fetching vehicles" }, { status: 500 })
	}
}
