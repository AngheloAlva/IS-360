import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
	try {
		const totalVehicles = await prisma.vehicle.count()

		const vehiclesByType = await prisma.vehicle.groupBy({
			by: ["type"],
			_count: true,
		})

		const mainVehicles = await prisma.vehicle.count({
			where: {
				isMain: {
					equals: true,
				},
			},
		})

		return NextResponse.json({
			totalVehicles,
			vehiclesByType: vehiclesByType.map((type) => ({
				type: type.type,
				count: type._count,
			})),
			mainVehicles,
		})
	} catch (error) {
		console.error("Error fetching vehicles distribution:", error)
		return NextResponse.json({ error: "Error fetching vehicles distribution" }, { status: 500 })
	}
}
