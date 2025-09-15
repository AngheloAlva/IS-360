import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"

import { LOCKOUT_PERMIT_STATUS } from "@prisma/client"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET(req: NextRequest): Promise<NextResponse> {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return new NextResponse("No autorizado", { status: 401 })
	}

	try {
		const searchParams = req.nextUrl.searchParams
		const companyId = searchParams.get("companyId") || null
		const dateFrom = searchParams.get("dateFrom") || null
		const dateTo = searchParams.get("dateTo") || null

		const filter = {
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
		}

		const [
			totalLockoutPermits,
			activeLockoutPermits,
			pendingLockoutPermits,
			completedLockoutPermits,
			rejectedLockoutPermits,
			lockoutPermitsByType,
			lockoutPermitsByMonth,
		] = await Promise.all([
			// Total lockout permits
			prisma.lockoutPermit.count({
				where: filter,
			}),
			// Active lockout permits
			prisma.lockoutPermit.count({
				where: {
					...filter,
					status: LOCKOUT_PERMIT_STATUS.ACTIVE,
				},
			}),
			// Pending lockout permits
			prisma.lockoutPermit.count({
				where: {
					...filter,
					status: LOCKOUT_PERMIT_STATUS.REVIEW_PENDING,
				},
			}),
			// Completed lockout permits
			prisma.lockoutPermit.count({
				where: {
					...filter,
					status: LOCKOUT_PERMIT_STATUS.COMPLETED,
				},
			}),
			// Rejected lockout permits
			prisma.lockoutPermit.count({
				where: {
					...filter,
					status: LOCKOUT_PERMIT_STATUS.REJECTED,
				},
			}),
			// Lockout permits by type
			prisma.lockoutPermit.groupBy({
				by: ["lockoutType"],
				where: filter,
				_count: {
					id: true,
				},
			}),
			// Lockout permits by month (last 6 months)
			(async () => {
				let query = `
					SELECT 
						DATE_TRUNC('month', "createdAt") as month,
						COUNT(*)::integer as count
					FROM "lockout_permit" 
					WHERE "createdAt" >= NOW() - INTERVAL '6 months'
				`
				const params: unknown[] = []
				let paramIndex = 1

				if (companyId) {
					query += ` AND "companyId" = $${paramIndex}`
					params.push(companyId)
					paramIndex++
				}

				if (dateFrom) {
					query += ` AND "createdAt" >= $${paramIndex}`
					params.push(new Date(dateFrom))
					paramIndex++
				}

				if (dateTo) {
					query += ` AND "createdAt" <= $${paramIndex}`
					params.push(new Date(dateTo))
					paramIndex++
				}

				query += `
					GROUP BY DATE_TRUNC('month', "createdAt")
					ORDER BY month DESC
				`

				return prisma.$queryRawUnsafe(query, ...params)
			})(),
		])

		// Calculate percentages
		const activePercentage =
			totalLockoutPermits > 0 ? (activeLockoutPermits / totalLockoutPermits) * 100 : 0
		const pendingPercentage =
			totalLockoutPermits > 0 ? (pendingLockoutPermits / totalLockoutPermits) * 100 : 0
		const completedPercentage =
			totalLockoutPermits > 0 ? (completedLockoutPermits / totalLockoutPermits) * 100 : 0
		const rejectedPercentage =
			totalLockoutPermits > 0 ? (rejectedLockoutPermits / totalLockoutPermits) * 100 : 0

		return NextResponse.json({
			overview: {
				total: totalLockoutPermits,
				active: activeLockoutPermits,
				pending: pendingLockoutPermits,
				completed: completedLockoutPermits,
				rejected: rejectedLockoutPermits,
			},
			percentages: {
				active: Math.round(activePercentage * 100) / 100,
				pending: Math.round(pendingPercentage * 100) / 100,
				completed: Math.round(completedPercentage * 100) / 100,
				rejected: Math.round(rejectedPercentage * 100) / 100,
			},
			byType: lockoutPermitsByType.map((item) => ({
				type: item.lockoutType,
				count: item._count.id,
			})),
			byMonth: lockoutPermitsByMonth,
		})
	} catch (error) {
		console.error("[LOCKOUT_PERMITS_STATS_GET]", error)
		return NextResponse.json({ error: "Error fetching lockout permit statistics" }, { status: 500 })
	}
}
