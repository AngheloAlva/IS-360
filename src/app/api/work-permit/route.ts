import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"

import { getAllowedCompanyIds } from "@/shared/actions/users/get-allowed-companies"
import { WORK_PERMIT_STATUS } from "@/generated/prisma/enums"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

import type { Prisma } from "@/generated/prisma/client"

export async function GET(req: NextRequest): Promise<NextResponse> {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return new NextResponse("No autorizado", { status: 401 })
	}

	try {
		const userAllowedCompanies = await getAllowedCompanyIds(session.user.id)

		const searchParams = req.nextUrl.searchParams
		const page = parseInt(searchParams.get("page") || "1")
		const limit = parseInt(searchParams.get("limit") || "10")
		const search = searchParams.get("search") || ""
		const statusFilter = searchParams.get("statusFilter") || null
		const companyId = searchParams.get("companyId") || null
		const typeFilter = searchParams.get("typeFilter") || null
		const includeMode = searchParams.get("include")
		const requestedSortBy = searchParams.get("sortBy") || searchParams.get("orderBy")
		const requestedSortOrder = searchParams.get("sortOrder") || searchParams.get("order")

		const sortOrder = requestedSortOrder === "asc" ? "asc" : "desc"
		const approvedBy = searchParams.get("approvedBy") || null
		const dateFrom = searchParams.get("dateFrom") || null
		const dateTo = searchParams.get("dateTo") || null
		const hasLockoutPermit = searchParams.get("hasLockoutPermit") === "true" || null
		const isExport = includeMode === "export"

		const getOrderBy = (): Prisma.WorkPermitOrderByWithRelationInput => {
			switch (requestedSortBy) {
				case "status":
					return { status: sortOrder }
				case "startDate":
					return { startDate: sortOrder }
				case "endDate":
					return { endDate: sortOrder }
				case "exactPlace":
					return { exactPlace: sortOrder }
				case "otNumber":
					return { otNumber: { otNumber: sortOrder } }
				case "companyName":
					return { company: { name: sortOrder } }
				case "applicantName":
					return { user: { name: sortOrder } }
				case "approvalByName":
					return { approvalBy: { name: sortOrder } }
				case "createdAt":
				default:
					return { createdAt: sortOrder }
			}
		}

		const skip = (page - 1) * limit

		const filter: Prisma.WorkPermitWhereInput = {
			...(search
				? {
						OR: [
							{ otNumber: { is: { workRequest: { contains: search, mode: "insensitive" } } } },
							{ otNumber: { is: { otNumber: { contains: search, mode: "insensitive" } } } },
							{ exactPlace: { contains: search, mode: "insensitive" } },
						],
					}
				: {}),
			...(statusFilter ? { status: statusFilter as WORK_PERMIT_STATUS } : {}),
			...(companyId ? { companyId: companyId } : {}),
			...(userAllowedCompanies?.length
				? {
						company: {
							id: {
								in: userAllowedCompanies,
							},
						},
					}
				: {}),
			...(dateFrom || dateTo
				? {
						createdAt: {
							...(dateFrom
								? { gte: new Date(new Date(decodeURIComponent(dateFrom)).setHours(0, 0, 0, 0)) }
								: {}),
							...(dateTo
								? { lte: new Date(new Date(decodeURIComponent(dateTo)).setHours(23, 59, 59, 999)) }
								: {}),
						},
					}
				: {}),
			...(approvedBy ? { approvalBy: { id: approvedBy } } : {}),
			...(typeFilter ? { workWillBe: typeFilter } : {}),
			...(hasLockoutPermit ? { lockoutPermits: { some: {} } } : {}),
		}

		const [workPermits, total] = await Promise.all([
			prisma.workPermit.findMany({
				where: filter,
				include: isExport
					? {
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
						}
					: {
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
							lockoutPermits: {
								select: {
									id: true,
									status: true,
									lockoutRegistrations: {
										select: {
											id: true,
											contractorLockNumber: true,
										},
									},
								},
							},
						},
				skip,
				take: limit,
				orderBy: getOrderBy(),
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
