import { NextResponse } from "next/server"
import { headers } from "next/headers"

import { ACCESS_ROLE } from "@prisma/client"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET(): Promise<NextResponse> {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return new NextResponse("No autorizado", { status: 401 })
	}

	try {
		// Estadísticas básicas
		const [totalUsers, twoFactorEnabled, totalContractors, totalSupervisors] = await Promise.all([
			prisma.user.count({
				where: {
					accessRole: ACCESS_ROLE.ADMIN,
					isActive: true,
				},
			}),
			prisma.user.count({
				where: {
					isActive: true,
					twoFactorEnabled: true,
					accessRole: ACCESS_ROLE.ADMIN,
				},
			}),
			prisma.user.count({
				where: {
					isActive: true,
					accessRole: ACCESS_ROLE.PARTNER_COMPANY,
				},
			}),
			prisma.user.count({
				where: {
					isActive: true,
					isSupervisor: true,
					accessRole: ACCESS_ROLE.PARTNER_COMPANY,
				},
			}),
		])

		return NextResponse.json({
			basicStats: {
				totalUsers,
				twoFactorEnabled,
				totalContractors,
				totalSupervisors,
			},
		})
	} catch (error) {
		console.error("[USERS_STATS_ERROR]", error)
		return NextResponse.json(
			{
				basicStats: {
					totalUsers: 0,
					twoFactorEnabled: 0,
					totalContractors: 0,
					totalSupervisors: 0,
				},
				charts: {
					topUsersByWorkOrders: [],
					documentActivity: [],
				},
			},
			{ status: 500 }
		)
	}
}
