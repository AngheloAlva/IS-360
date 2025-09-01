import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"

import { WORK_PERMIT_STATUS } from "@prisma/client"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

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
		const statusFilter = searchParams.get("statusFilter") || null
		const companyId = searchParams.get("companyId") || null
		const typeFilter = searchParams.get("typeFilter") || null
		const orderBy = searchParams.get("orderBy") as OrderBy
		const order = searchParams.get("order") as Order
		const approvedBy = searchParams.get("approvedBy") || null
		const dateFrom = searchParams.get("dateFrom") || null
		const dateTo = searchParams.get("dateTo") || null

		const skip = (page - 1) * limit

		const filter = {
			...(search
				? {
						otNumber: {
							OR: [
								{ workRequest: { contains: search, mode: "insensitive" as const } },
								{ otNumber: { contains: search, mode: "insensitive" as const } },
							],
						},
					}
				: {}),
			...(statusFilter ? { status: statusFilter as WORK_PERMIT_STATUS } : {}),
			...(companyId ? { companyId: companyId } : {}),
			...(dateFrom || dateTo
				? {
						createdAt: {
							...(dateFrom ? { gte: new Date(new Date(decodeURIComponent(dateFrom)).setHours(0, 0, 0, 0)) } : {}),
							...(dateTo ? { lte: new Date(new Date(decodeURIComponent(dateTo)).setHours(23, 59, 59, 999)) } : {}),
						},
					}
				: {}),
			...(approvedBy ? { approvalBy: { id: approvedBy } } : {}),
			...(typeFilter ? { workWillBe: typeFilter } : {}),
		}

		const [workPermits, total] = await Promise.all([
			prisma.workPermit.findMany({
				where: filter,
				include: {
					approvalBy: {
						select: {
							id: true,
							rut: true,
							name: true,
						},
					},
					closingBy: {
						select: {
							id: true,
							rut: true,
							name: true,
						},
					},
					otNumber: {
						select: {
							otNumber: true,
							workRequest: true,
							workDescription: true,
						},
					},
					user: {
						select: {
							id: true,
							name: true,
							rut: true,
						},
					},
					company: {
						select: {
							id: true,
							name: true,
							rut: true,
						},
					},
					_count: {
						select: {
							participants: true,
							attachments: true,
						},
					},
					participants: {
						select: {
							id: true,
							name: true,
						},
					},
					attachments: {
						select: {
							id: true,
							name: true,
							url: true,
							type: true,
							size: true,
							uploadedAt: true,
							uploadedBy: {
								select: {
									id: true,
									name: true,
								},
							},
						},
						orderBy: {
							uploadedAt: "desc",
						},
					},
				},
				skip,
				take: limit,
				orderBy: {
					[orderBy]: order,
				},
			}),
			prisma.workPermit.count({
				where: filter,
			}),
		])

		return NextResponse.json({
			workPermits,
			total,
			pages: Math.ceil(total / limit),
		})
	} catch (error) {
		console.error("[WORK_BOOKS_GET]", error)
		return NextResponse.json({ error: "Error fetching work books" }, { status: 500 })
	}
}
