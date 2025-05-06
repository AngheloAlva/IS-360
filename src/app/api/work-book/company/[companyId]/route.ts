import { NextRequest, NextResponse } from "next/server"

import prisma from "@/lib/prisma"

export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ companyId: string }> }
) {
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
					isWorkBook: true,
					companyId,
					isWorkBookInit: onlyBooks,
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
					type: true,
					otNumber: true,
					workName: true,
					priority: true,
					workRequest: true,
					programDate: true,
					workLocation: true,
					workStartDate: true,
					estimatedDays: true,
					estimatedHours: true,
					workDescription: true,
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
			prisma.workOrder.count({
				where: {
					isWorkBook: true,
					companyId,
					isWorkBookInit: onlyBooks,
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
