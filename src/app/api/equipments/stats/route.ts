import { NextResponse } from "next/server"
import { headers } from "next/headers"

import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET() {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return new NextResponse("No autorizado", { status: 401 })
	}

	try {
		// 1. Total count of equipment
		const totalEquipment = await prisma.equipment.count({})

		// 2. Equipment by operational status
		const equipmentByStatus = await prisma.equipment.groupBy({
			by: ["isOperational"],
			_count: {
				id: true,
			},
		})

		// 3. Equipment by type
		const equipmentByType = await prisma.equipment.groupBy({
			by: ["type"],
			_count: {
				id: true,
			},
			orderBy: {
				_count: {
					id: "desc",
				},
			},
			take: 5, // Limit to top 5 types
		})

		// 4. Equipment by criticality
		const equipmentByCriticality = await prisma.equipment.groupBy({
			by: ["criticality"],
			_count: {
				id: true,
			},
		})

		// 5. Work orders by status
		const workOrdersByStatus = await prisma.workOrder.groupBy({
			by: ["status"],
			_count: {
				id: true,
			},
		})

		// 6. Top equipment with most work orders
		const topEquipmentWithWorkOrders = await prisma.equipment.findMany({
			select: {
				id: true,
				name: true,
				tag: true,
				_count: {
					select: {
						workOrders: true,
					},
				},
			},
			orderBy: {
				workOrders: {
					_count: "desc",
				},
			},
			take: 5,
		})

		// 7. Equipment hierarchy distribution (count of equipment at each level)
		const parentEquipmentCount = await prisma.equipment.count({
			where: {
				parentId: null,
			},
		})

		const childEquipmentCount = await prisma.equipment.count({
			where: {
				NOT: {
					parentId: null,
				},
			},
		})

		// 8. Equipment maintenance activity over time (last 30 days)
		const thirtyDaysAgo = new Date()
		thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

		const maintenanceActivity = await prisma.workOrder.findMany({
			where: {
				createdAt: {
					gte: thirtyDaysAgo,
				},
			},
			select: {
				id: true,
				status: true,
				createdAt: true,
				equipments: {
					select: {
						id: true,
						name: true,
						tag: true,
					},
				},
			},
			orderBy: {
				createdAt: "asc",
			},
		})

		// Process maintenance activity data by day
		const maintenanceByDay: Record<string, { date: string; count: number }> = {}
		maintenanceActivity.forEach((activity) => {
			const date = activity.createdAt.toISOString().split("T")[0]
			if (!maintenanceByDay[date]) {
				maintenanceByDay[date] = { date, count: 0 }
			}
			maintenanceByDay[date].count++
		})

		// Convert to array for chart consumption
		const maintenanceActivityData = Object.values(maintenanceByDay)

		return NextResponse.json({
			totalEquipment,
			equipmentByStatus: equipmentByStatus.map((item) => ({
				status: item.isOperational ? "Operational" : "Non-operational",
				count: item._count.id,
				fill: item.isOperational ? "var(--color-emerald-500)" : "var(--color-rose-500)",
			})),
			equipmentByType: equipmentByType.map((item) => ({
				type: item.type || "Unspecified",
				count: item._count.id,
			})),
			equipmentByCriticality: equipmentByCriticality.map((item) => ({
				criticality: item.criticality || "Unspecified",
				count: item._count.id,
			})),
			workOrdersByStatus: workOrdersByStatus.map((item) => ({
				status: item.status,
				count: item._count.id,
			})),
			topEquipmentWithWorkOrders: topEquipmentWithWorkOrders.map((item) => ({
				id: item.id,
				name: item.name,
				tag: item.tag,
				workOrderCount: item._count.workOrders,
			})),
			equipmentHierarchy: {
				parentEquipment: parentEquipmentCount,
				childEquipment: childEquipmentCount,
			},
			maintenanceActivityData,
		})
	} catch (error) {
		console.error("[EQUIPMENT_STATS]", error)
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
	}
}
