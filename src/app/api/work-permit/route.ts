import { NextRequest, NextResponse } from "next/server"

import { WORK_PERMIT_STATUS } from "@prisma/client"
import prisma from "@/lib/prisma"

export async function GET(req: NextRequest) {
	try {
		const searchParams = req.nextUrl.searchParams
		const page = parseInt(searchParams.get("page") || "1")
		const limit = parseInt(searchParams.get("limit") || "10")
		const search = searchParams.get("search") || ""
		const statusFilter = searchParams.get("statusFilter") || null
		const companyId = searchParams.get("companyId") || null
		const startDate = searchParams.get("startDate") || null
		const endDate = searchParams.get("endDate") || null

		const skip = (page - 1) * limit

		const filter = {
			...(search
				? {
						OR: [
							{
								otNumber: {
									otNumber: {
										contains: search,
										mode: "insensitive" as const,
									},
								},
							},
						],
					}
				: {}),
			...(statusFilter
				? {
						status: statusFilter as WORK_PERMIT_STATUS,
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

		const [workPermits, total] = await Promise.all([
			prisma.workPermit.findMany({
				where: filter,
				select: {
					id: true,
					otNumber: {
						select: {
							otNumber: true,
							workName: true,
						},
					},
					status: true,
					mutuality: true,
					otherMutuality: true,
					exactPlace: true,
					workWillBe: true,
					workWillBeOther: true,
					tools: true,
					otherTools: true,
					preChecks: true,
					otherPreChecks: true,
					riskIdentification: true,
					otherRisk: true,
					preventiveControlMeasures: true,
					otherPreventiveControlMeasures: true,
					generateWaste: true,
					wasteType: true,
					wasteDisposalLocation: true,
					observations: true,
					startDate: true,
					endDate: true,
					user: {
						select: {
							name: true,
							rut: true,
						},
					},
					company: {
						select: {
							name: true,
							rut: true,
						},
					},
					_count: {
						select: {
							participants: true,
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
			prisma.workPermit.count({
				where: filter,
				cacheStrategy: {
					ttl: 60,
					swr: 10,
				},
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
