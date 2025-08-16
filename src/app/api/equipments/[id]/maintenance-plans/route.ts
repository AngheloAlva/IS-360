import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		})

		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
		}

		const { id } = await params
		const { searchParams } = new URL(req.url)
		const limit = parseInt(searchParams.get("limit") || "5")

		const maintenancePlans = await prisma.maintenancePlan.findMany({
			where: {
				equipmentId: id,
			},
			select: {
				id: true,
				name: true,
				description: true,
				createdAt: true,
				updatedAt: true,
				_count: {
					select: {
						task: true,
					},
				},
			},
			orderBy: {
				createdAt: "desc",
			},
			take: limit,
		})

		return NextResponse.json(maintenancePlans)
	} catch (error) {
		console.error("[EQUIPMENT_MAINTENANCE_PLANS]", error)
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
	}
}
