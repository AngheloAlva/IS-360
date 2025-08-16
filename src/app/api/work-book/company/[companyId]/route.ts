import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"

import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ companyId: string }> }
): Promise<NextResponse> {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return new NextResponse("No autorizado", { status: 401 })
	}

	try {
		const companyId = (await params).companyId

		const searchParams = req.nextUrl.searchParams
		const page = parseInt(searchParams.get("page") || "1")
		const limit = parseInt(searchParams.get("limit") || "10")
		const search = searchParams.get("search") || ""
		const onlyBooks = searchParams.get("onlyBooks") === "true"

		const skip = (page - 1) * limit

		const [workBooks, total] = await Promise.all([
			prisma.workOrder.findMany({
				where: {
					companyId,
					isWorkBookInit: onlyBooks,
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
					type: true,
					otNumber: true,
					workBookName: true,
					priority: true,
					workRequest: true,
					programDate: true,
					workBookLocation: true,
					workBookStartDate: true,
					estimatedDays: true,
					estimatedHours: true,
					workDescription: true,
					estimatedEndDate: true,
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
			prisma.workOrder.count({
				where: {
					companyId,
					isWorkBookInit: onlyBooks,
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
