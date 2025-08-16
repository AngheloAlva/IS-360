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

		const skip = (page - 1) * limit

		// Get statistics
		const [workBooks, total] = await Promise.all([
			prisma.workOrder.findMany({
				where: {
					...(search
						? {
								OR: [
									{ workBookName: { contains: search, mode: "insensitive" as const } },
									{ workBookLocation: { contains: search, mode: "insensitive" as const } },
									{ otNumber: { contains: search, mode: "insensitive" as const } },
								],
							}
						: {}),
				},
				select: {
					id: true,
					otNumber: true,
					workBookName: true,
					workBookLocation: true,
					workBookStartDate: true,
					progress: true,
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
					equipments: {
						select: {
							id: true,
							name: true,
						},
					},
					_count: {
						select: {
							workBookEntries: true,
						},
					},
				},
				skip,
				take: limit,
				orderBy: {
					createdAt: "desc",
				},
			}),
			// Get total count
			prisma.workOrder.count({
				where: {
					...(search
						? {
								OR: [
									{ workBookName: { contains: search, mode: "insensitive" as const } },
									{ workBookLocation: { contains: search, mode: "insensitive" as const } },
									{ otNumber: { contains: search, mode: "insensitive" as const } },
								],
							}
						: {}),
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
