import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
	try {
		const areaDistribution = await prisma.user.groupBy({
			by: ["area"],
			_count: true,
		})

		return NextResponse.json({
			areaDistribution: areaDistribution
				.filter((item) => item.area !== null)
				.map((item) => ({
					area: item.area,
					count: item._count,
				})),
		})
	} catch (error) {
		console.error("Error fetching area distribution:", error)
		return NextResponse.json({ error: "Error fetching area distribution" }, { status: 500 })
	}
}
