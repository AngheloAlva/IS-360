import { NextRequest, NextResponse } from "next/server"

import prisma from "@/lib/prisma"

export async function GET(req: NextRequest) {
	try {
		const searchParams = req.nextUrl.searchParams
		const page = parseInt(searchParams.get("page") || "1")
		const limit = parseInt(searchParams.get("limit") || "10")
		const search = searchParams.get("search") || ""
		const parentId = searchParams.get("parentId")

		const skip = (page - 1) * limit

		const [equipments, total] = await Promise.all([
			prisma.equipment.findMany({
				where: {
					parentId: parentId,
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
					createdAt: "desc",
				},
				cacheStrategy: {
					ttl: 10,
				},
			}),
			prisma.equipment.count({
				where: {
					parentId: parentId,
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
