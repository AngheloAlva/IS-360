import { NextRequest, NextResponse } from "next/server"

import prisma from "@/lib/prisma"

export async function GET(req: NextRequest) {
	try {
		const searchParams = req.nextUrl.searchParams
		const page = parseInt(searchParams.get("page") || "1")
		const limit = parseInt(searchParams.get("limit") || "10")
		const search = searchParams.get("search") || ""

		const skip = (page - 1) * limit

		// Get statistics
		const [workBooks, total] = await Promise.all([
			prisma.workOrder.findMany({
				where: {
					isWorkBook: true,
					...(search
						? {
								OR: [
									{ workName: { contains: search, mode: "insensitive" as const } },
									{ workLocation: { contains: search, mode: "insensitive" as const } },
									{ otNumber: { contains: search, mode: "insensitive" as const } },
								],
							}
						: {}),
				},
				select: {
					id: true,
					otNumber: true,
					workName: true,
					workLocation: true,
					workStartDate: true,
					workProgressStatus: true,
					status: true,
					solicitationDate: true,
					company: {
						select: {
							id: true,
							name: true,
						},
					},
					supervisor: {
						select: {
							id: true,
							name: true,
							email: true,
							role: true,
						},
					},
					responsible: {
						select: {
							id: true,
							name: true,
							email: true,
							role: true,
						},
					},
					equipment: {
						select: {
							id: true,
							name: true,
						},
					},
					_count: {
						select: {
							workEntries: true,
						},
					},
				},
				skip,
				take: limit,
				orderBy: {
					createdAt: "desc",
				},
				cacheStrategy: {
					ttl: 60,
					swr: 10,
				},
			}),
			// Get total count
			prisma.workOrder.count({
				where: {
					isWorkBook: true,
					...(search
						? {
								OR: [
									{ workName: { contains: search, mode: "insensitive" as const } },
									{ workLocation: { contains: search, mode: "insensitive" as const } },
									{ otNumber: { contains: search, mode: "insensitive" as const } },
								],
							}
						: {}),
				},
				cacheStrategy: {
					ttl: 60,
					swr: 10,
				},
			}),
		])

		return NextResponse.json({
			workBooks,
			total,
			pages: Math.ceil(total / limit),
		})
	} catch (error) {
		console.error("[WORK_BOOKS_GET]", error)
		return NextResponse.json({ error: "Error fetching work books" }, { status: 500 })
	}
}
