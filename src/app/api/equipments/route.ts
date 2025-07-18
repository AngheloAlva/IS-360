import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

import type { Order, OrderBy } from "@/shared/components/OrderByButton"

export async function GET(req: NextRequest) {
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
		const parentId = searchParams.get("parentId") || null
		const showAll = searchParams.get("showAll") === "true"
		const orderBy = searchParams.get("orderBy") as OrderBy
		const order = searchParams.get("order") as Order

		const skip = (page - 1) * limit

		const [equipments, total] = await Promise.all([
			prisma.equipment.findMany({
				where: {
					...(showAll ? {} : { parentId }),
					...(search
						? {
								OR: [
									{ name: { contains: search, mode: "insensitive" } },
									{ location: { contains: search, mode: "insensitive" } },
									{ tag: { contains: search, mode: "insensitive" } },
								],
							}
						: {}),
				},
				select: {
					id: true,
					name: true,
					location: true,
					createdAt: true,
					updatedAt: true,
					description: true,
					isOperational: true,
					type: true,
					tag: true,
					parentId: true,
					attachments: {
						select: {
							id: true,
							url: true,
							name: true,
							type: true,
						},
					},
					children: {
						select: {
							id: true,
							name: true,
							location: true,
							createdAt: true,
							updatedAt: true,
							description: true,
							isOperational: true,
							type: true,
							tag: true,
							_count: {
								select: {
									workOrders: true,
									children: true,
								},
							},
						},
					},
					_count: {
						select: {
							workOrders: true,
							children: true,
						},
					},
				},
				skip,
				take: limit,
				orderBy: {
					[orderBy]: order,
				},
				cacheStrategy: {
					ttl: 10,
				},
			}),
			prisma.equipment.count({
				where: {
					...(showAll ? {} : { parentId }),
					...(search
						? {
								OR: [
									{ name: { contains: search, mode: "insensitive" } },
									{ location: { contains: search, mode: "insensitive" } },
									{ tag: { contains: search, mode: "insensitive" } },
								],
							}
						: {}),
				},
				cacheStrategy: {
					ttl: 10,
				},
			}),
		])

		return NextResponse.json({
			total,
			equipments,
			pages: Math.ceil(total / limit),
		})
	} catch (error) {
		console.error("[EQUIPMENT_GET]", error)
		return NextResponse.json({ error: "Error fetching equipments" }, { status: 500 })
	}
}
