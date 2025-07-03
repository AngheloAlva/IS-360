import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

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

		const skip = (page - 1) * limit

		const [operators, total] = await Promise.all([
			prisma.user.findMany({
				where: {
					companyId: process.env.NEXT_PUBLIC_OTC_COMPANY_ID,
				},
				select: {
					id: true,
					rut: true,
					name: true,
				},
				skip,
				take: limit,
				orderBy: {
					name: "desc",
				},
				cacheStrategy: {
					ttl: 60,
					swr: 10,
				},
			}),
			prisma.user.count({
				where: {
					companyId: process.env.NEXT_PUBLIC_OTC_COMPANY_ID,
				},
				cacheStrategy: {
					ttl: 60,
					swr: 10,
				},
			}),
		])

		return NextResponse.json({
			total,
			operators,
			pages: Math.ceil(total / limit),
		})
	} catch (error) {
		console.error("[OPERATORS_GET]", error)
		return NextResponse.json({ error: "Error fetching operators" }, { status: 500 })
	}
}
