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

		const workOrders = await prisma.workOrder.findMany({
			where: {
				equipments: {
					some: {
						id,
					},
				},
			},
			select: {
				id: true,
				otNumber: true,
				type: true,
				status: true,
				solicitationDate: true,
				solicitationTime: true,
				programDate: true,
				estimatedEndDate: true,
				workDescription: true,
				company: {
					select: {
						id: true,
						name: true,
					},
				},
				responsible: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
				supervisor: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
			},
			orderBy: {
				createdAt: "desc",
			},
			take: limit,
		})

		return NextResponse.json(workOrders)
	} catch (error) {
		console.error("[EQUIPMENT_WORK_ORDERS]", error)
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
	}
}
