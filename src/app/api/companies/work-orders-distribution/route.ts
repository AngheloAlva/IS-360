import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
	try {
		const workOrdersDistribution = await prisma.company.findMany({
			select: {
				id: true,
				name: true,
				_count: {
					select: {
						workOrders: true,
					},
				},
			},
		})

		return NextResponse.json({
			workOrdersDistribution: workOrdersDistribution.map((company) => ({
				name: company.name,
				count: company._count.workOrders,
			})),
		})
	} catch (error) {
		console.error("Error fetching work orders distribution:", error)
		return NextResponse.json({ error: "Error fetching work orders distribution" }, { status: 500 })
	}
}
