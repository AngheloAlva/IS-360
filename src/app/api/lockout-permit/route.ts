import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"

import { LOCKOUT_PERMIT_STATUS, LOCKOUT_TYPE } from "@prisma/client"
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
						OR: [
							{ activitiesToExecute: { hasSome: [search] } },
							{ observations: { contains: search, mode: "insensitive" as const } },
							{ requestedBy: { name: { contains: search, mode: "insensitive" as const } } },
							{ areaResponsible: { name: { contains: search, mode: "insensitive" as const } } },
							{ company: { name: { contains: search, mode: "insensitive" as const } } },
							{
								equipments: { some: { name: { contains: search, mode: "insensitive" as const } } },
							},
							{ otNumberRef: { otNumber: { contains: search, mode: "insensitive" as const } } },
						],
					}
				: {}),
			...(statusFilter ? { status: statusFilter as LOCKOUT_PERMIT_STATUS } : {}),
			...(companyId ? { companyId: companyId } : {}),
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
			...(approvedBy ? { supervisor: { id: approvedBy } } : {}),
			...(typeFilter ? { lockoutType: typeFilter as LOCKOUT_TYPE } : {}),
		}

		const [lockoutPermits, total] = await Promise.all([
			prisma.lockoutPermit.findMany({
				where: filter,
				include: {
					supervisor: {
						select: {
							id: true,
							rut: true,
							name: true,
						},
					},
					operator: {
						select: {
							id: true,
							rut: true,
							name: true,
						},
					},
					removeLockout: {
						select: {
							id: true,
							rut: true,
							name: true,
						},
					},
					areaResponsible: {
						select: {
							id: true,
							name: true,
							rut: true,
						},
					},
					requestedBy: {
						select: {
							id: true,
							name: true,
							rut: true,
						},
					},
					otNumberRef: {
						select: {
							id: true,
							otNumber: true,
							workRequest: true,
							workDescription: true,
						},
					},
					company: {
						select: {
							id: true,
							name: true,
							rut: true,
						},
					},
					equipments: {
						select: {
							id: true,
							tag: true,
							name: true,
							location: true,
						},
					},
					_count: {
						select: {
							attachments: true,
							lockoutRegistrations: true,
							zeroEnergyReviews: true,
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
					lockoutRegistrations: {
						select: {
							id: true,
							order: true,
							name: true,
							rut: true,
							lockNumber: true,
							installDate: true,
							installTime: true,
							removeDate: true,
							removeTime: true,
							createdAt: true,
							updatedAt: true,
						},
						orderBy: {
							order: "asc",
						},
					},
					zeroEnergyReviews: {
						select: {
							id: true,
							equipment: {
								select: {
									id: true,
									name: true,
									tag: true,
									location: true,
								},
							},
							location: true,
							action: true,
							reviewedZero: true,
							createdAt: true,
							performedBy: {
								select: {
									id: true,
									name: true,
									rut: true,
								},
							},
							reviewer: {
								select: {
									id: true,
									name: true,
									rut: true,
								},
							},
						},
					},
				},
				skip,
				take: limit,
				orderBy: {
					[orderBy]: order,
				},
			}),
			prisma.lockoutPermit.count({
				where: filter,
			}),
		])

		return NextResponse.json({
			lockoutPermits,
			total,
			pages: Math.ceil(total / limit),
		})
	} catch (error) {
		console.error("[LOCKOUT_PERMITS_GET]", error)
		return NextResponse.json({ error: "Error fetching lockout permits" }, { status: 500 })
	}
}
