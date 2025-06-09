import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
	try {
		const [totalVehicles, vehiclesByType, mainVehicles] = await Promise.all([
			prisma.vehicle.count({
				cacheStrategy: { ttl: 10 },
			}),
			prisma.vehicle.groupBy({
				by: ["type"],
				_count: true,
				cacheStrategy: { ttl: 10 },
			}),
			prisma.vehicle.count({
				where: { isMain: { equals: true } },
				cacheStrategy: { ttl: 10 },
			}),
		])

		return NextResponse.json({
			totalVehicles,
			vehiclesByType: vehiclesByType.map(({ type, _count }) => ({ type, count: _count })),
			mainVehicles,
		})
	} catch (error) {
		console.error("Error fetching vehicles distribution:", error)
		return NextResponse.json({ error: "Error fetching vehicles distribution" }, { status: 500 })
	}
}
