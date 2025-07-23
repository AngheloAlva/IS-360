import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { format } from "date-fns"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { WORK_PERMIT_STATUS } from "@prisma/client"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest): Promise<NextResponse> {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return new NextResponse("No autorizado", { status: 401 })
	}

	try {
		const searchParams = req.nextUrl.searchParams
		const search = searchParams.get("search") || ""
		const statusFilter = searchParams.get("statusFilter") || null
		const companyId = searchParams.get("companyId") || null
		const typeFilter = searchParams.get("typeFilter") || null
		const approvedBy = searchParams.get("approvedBy") || null
		const date = searchParams.get("date") || null

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
			...(date
				? {
						createdAt: {
							gte: new Date(new Date(decodeURIComponent(date)).setHours(0, 0, 0, 0)),
							lt: new Date(new Date(decodeURIComponent(date)).setHours(23, 59, 59, 999)),
						},
					}
				: {}),
			...(approvedBy ? { approvalBy: { id: approvedBy } } : {}),
			...(typeFilter ? { workWillBe: typeFilter } : {}),
		}

		const totalWorkPermits = await prisma.workPermit.count({
			where: filter,
			cacheStrategy: {
				ttl: 120,
				swr: 10,
			},
		})

		const workPermitsByStatus = await prisma.workPermit.groupBy({
			by: ["status"],
			where: filter,
			_count: {
				id: true,
			},
			cacheStrategy: {
				ttl: 120,
				swr: 10,
			},
		})

		const workPermitsByType = await prisma.workPermit.groupBy({
			by: ["workWillBe"],
			where: filter,
			_count: {
				id: true,
			},
			orderBy: {
				_count: {
					id: "desc",
				},
			},
			take: 5,
			cacheStrategy: {
				ttl: 120,
				swr: 10,
			},
		})

		const activeWorkPermitsByCompany = await prisma.workPermit.groupBy({
			by: ["companyId"],
			where: {
				...filter,
				status: "ACTIVE",
			},
			_count: {
				id: true,
			},
			orderBy: {
				_count: {
					id: "desc",
				},
			},
			take: 5,
			cacheStrategy: {
				ttl: 120,
				swr: 10,
			},
		})

		const thirtyDaysAgo = new Date()
		thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

		const activityFilter = {
			...filter,
			createdAt: {
				gte: thirtyDaysAgo,
			},
		}

		const workPermitActivity = await prisma.workPermit.findMany({
			where: activityFilter,
			select: {
				id: true,
				status: true,
				createdAt: true,
				company: {
					select: {
						id: true,
						name: true,
					},
				},
			},
			orderBy: {
				createdAt: "asc",
			},
			cacheStrategy: {
				ttl: 120,
				swr: 10,
			},
		})

		const activityByDay: Record<string, { date: Date; count: number }> = {}
		workPermitActivity.forEach((activity) => {
			const date = format(activity.createdAt, "dd-MM")
			if (!activityByDay[date]) {
				activityByDay[date] = { date: activity.createdAt, count: 0 }
			}
			activityByDay[date].count++
		})

		const companyDetails = await prisma.company.findMany({
			where: {
				id: {
					in: activeWorkPermitsByCompany.map((wp) => wp.companyId),
				},
			},
			select: {
				id: true,
				name: true,
			},
			cacheStrategy: {
				ttl: 120,
				swr: 10,
			},
		})

		return NextResponse.json({
			totalWorkPermits,
			workPermitsByStatus: workPermitsByStatus.map((item) => ({
				status: item.status,
				count: item._count.id,
				fill: getStatusColor(item.status),
			})),
			workPermitsByType: workPermitsByType.map((item) => ({
				type: item.workWillBe || "Otro",
				count: item._count.id,
			})),
			activeWorkPermitsByCompany: activeWorkPermitsByCompany.map((item) => ({
				companyId: item.companyId,
				companyName: companyDetails.find((c) => c.id === item.companyId)?.name || "Unknown",
				count: item._count.id,
			})),
			activityData: Object.values(activityByDay),
		})
	} catch (error) {
		console.error("[WORK_PERMIT_STATS]", error)
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
	}
}

function getStatusColor(status: string): string {
	switch (status) {
		case "ACTIVE":
			return "var(--color-pink-500)"
		case "COMPLETED":
			return "var(--color-purple-500)"
		default:
			return "var(--color-red-500)"
	}
}
