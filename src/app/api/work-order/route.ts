import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { subDays } from "date-fns"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import {
	MILESTONE_STATUS,
	WORK_ORDER_STATUS,
	type WORK_ORDER_TYPE,
	type WORK_ORDER_PRIORITY,
} from "@prisma/client"

import type { Order, OrderBy } from "@/shared/components/OrderByButton"

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
		const typeFilter = searchParams.get("typeFilter") || null
		const statusFilter = searchParams.get("statusFilter") || null
		const priorityFilter = searchParams.get("priorityFilter") || null
		const companyId = searchParams.get("companyId") || null
		const startDate = searchParams.get("startDate") || null
		const endDate = searchParams.get("endDate") || null
		const permitFilter = searchParams.get("permitFilter") === "true"
		const order = searchParams.get("order") as Order
		const orderBy = searchParams.get("orderBy") as OrderBy
		const isOtcMember = searchParams.get("isOtcMember") === "true"
		const onlyWithRequestClousure = searchParams.get("onlyWithRequestClousure") === "true"
		const includeEquipments = searchParams.get("includeEquipments") === "true"

		let orderByField: string

		if (orderBy === "name") {
			orderByField = "workBookName"
		} else {
			orderByField = "createdAt"
		}

		const skip = (page - 1) * limit

		const filter = {
			...(search
				? {
						OR: [
							{ workBookName: { contains: search, mode: "insensitive" as const } },
							{ workRequest: { contains: search, mode: "insensitive" as const } },
							{ workBookLocation: { contains: search, mode: "insensitive" as const } },
							{ otNumber: { contains: search, mode: "insensitive" as const } },
							{ supervisor: { name: { contains: search, mode: "insensitive" as const } } },
							{ company: { name: { contains: search, mode: "insensitive" as const } } },
						],
					}
				: {}),
			...(statusFilter
				? { status: statusFilter as WORK_ORDER_STATUS }
				: permitFilter
					? { status: { in: [WORK_ORDER_STATUS.PLANNED, WORK_ORDER_STATUS.IN_PROGRESS] } }
					: {}),
			...(priorityFilter
				? {
						priority: priorityFilter as WORK_ORDER_PRIORITY,
					}
				: {}),
			...(permitFilter
				? {
						estimatedEndDate: { gte: subDays(new Date(), 1) },
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
			...(isOtcMember
				? {
						companyId: process.env.NEXT_PUBLIC_OTC_COMPANY_ID!,
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
			...(onlyWithRequestClousure
				? {
						milestones: {
							some: {
								status: MILESTONE_STATUS.REQUESTED_CLOSURE,
							},
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
					company: {
						select: {
							id: true,
							image: true,
							name: true,
							rut: true,
						},
					},
					supervisor: {
						select: {
							id: true,
							rut: true,
							name: true,
							email: true,
							image: true,
							phone: true,
						},
					},
					workRequest: true,
					progress: true,
					status: true,
					solicitationDate: true,
					estimatedEndDate: true,
					estimatedHours: true,
					estimatedDays: true,
					type: true,
					priority: true,
					programDate: true,
					...(includeEquipments
						? {
								equipment: {
									select: {
										name: true,
									},
								},
							}
						: {}),
					_count: {
						select: {
							workBookEntries: {
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
					[orderByField]: order,
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
						progress: true,
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
