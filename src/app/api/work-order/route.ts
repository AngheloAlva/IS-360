import { NextRequest, NextResponse } from "next/server"

import prisma from "@/lib/prisma"
import { WORK_ORDER_STATUS, WORK_ORDER_TYPE } from "@prisma/client"

export async function GET(req: NextRequest) {
	try {
		const searchParams = req.nextUrl.searchParams
		const page = parseInt(searchParams.get("page") || "1")
		const limit = parseInt(searchParams.get("limit") || "10")
		const search = searchParams.get("search") || ""
		const typeFilter = searchParams.get("typeFilter") || null
		const statusFilter = searchParams.get("statusFilter") || null
		const companyId = searchParams.get("companyId") || null
		const startDate = searchParams.get("startDate") || null
		const endDate = searchParams.get("endDate") || null

		const skip = (page - 1) * limit

		const filter = {
			...(search
				? {
						OR: [
							{ workName: { contains: search, mode: "insensitive" as const } },
							{ workLocation: { contains: search, mode: "insensitive" as const } },
							{ otNumber: { contains: search, mode: "insensitive" as const } },
						],
					}
				: {}),
			...(statusFilter
				? {
						status: statusFilter as WORK_ORDER_STATUS,
					}
				: {}),
			...(typeFilter
				? {
						type: typeFilter as WORK_ORDER_TYPE,
					}
				: {}),
			...(companyId
				? {
						companyId: companyId,
					}
				: {}),
			...(startDate || endDate
				? {
						solicitationDate: {
							...(startDate ? { gte: new Date(startDate) } : {}),
							...(endDate ? { lte: new Date(endDate) } : {}),
						},
					}
				: {}),
		}

		const [workOrders, total, stats] = await Promise.all([
			prisma.workOrder.findMany({
				where: filter,
				select: {
					id: true,
					otNumber: true,
					solicitationDate: true,
					type: true,
					status: true,
					capex: true,
					solicitationTime: true,
					workRequest: true,
					workDescription: true,
					priority: true,
					initReport: {
						select: {
							url: true,
						},
					},
					endReport: true,
					programDate: true,
					estimatedHours: true,
					estimatedDays: true,
					estimatedEndDate: true,
					equipment: {
						select: {
							id: true,
							name: true,
						},
					},
					company: {
						select: {
							name: true,
							rut: true,
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
					_count: {
						select: {
							workEntries: {
								where: {
									entryType: { in: ["ADDITIONAL_ACTIVITY", "DAILY_ACTIVITY"] },
								},
							},
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
				where: filter,
			}),
			prisma.$transaction([
				prisma.workOrder.count({
					where: {
						status: { in: ["IN_PROGRESS", "PENDING"] },
					},
				}),
				prisma.workOrder.count({
					where: {
						status: "COMPLETED",
					},
				}),
				prisma.workOrder.aggregate({
					_avg: {
						workProgressStatus: true,
					},
				}),
			]),
		])

		const [activeCount, completedCount, totalEntries] = stats

		return NextResponse.json({
			workOrders,
			total,
			pages: Math.ceil(total / limit),
			stats: {
				activeCount,
				completedCount,
				totalEntries,
			},
		})
	} catch (error) {
		console.error("[WORK_BOOKS_GET]", error)
		return NextResponse.json({ error: "Error fetching work books" }, { status: 500 })
	}
}
