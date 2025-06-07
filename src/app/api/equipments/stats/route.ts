import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET() {
	try {
		// 1. Total count of equipment
		const totalEquipment = await prisma.equipment.count({
			cacheStrategy: {
				ttl: 120,
				swr: 10,
			},
		})

		// 2. Equipment by operational status
		const equipmentByStatus = await prisma.equipment.groupBy({
			by: ["isOperational"],
			_count: {
				id: true,
			},
			cacheStrategy: {
				ttl: 120,
				swr: 10,
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
			cacheStrategy: {
				ttl: 120,
				swr: 10,
			},
		})

		// 4. Equipment by criticality
		const equipmentByCriticality = await prisma.equipment.groupBy({
			by: ["criticality"],
			_count: {
				id: true,
			},
			cacheStrategy: {
				ttl: 120,
				swr: 10,
			},
		})

		// 5. Work orders by status
		const workOrdersByStatus = await prisma.workOrder.groupBy({
			by: ["status"],
			_count: {
				id: true,
			},
			cacheStrategy: {
				ttl: 120,
				swr: 10,
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
			cacheStrategy: {
				ttl: 120,
				swr: 10,
			},
		})

		// 7. Equipment hierarchy distribution (count of equipment at each level)
		const parentEquipmentCount = await prisma.equipment.count({
			where: {
				parentId: null,
			},
			cacheStrategy: {
				ttl: 120,
				swr: 10,
			},
		})

		const childEquipmentCount = await prisma.equipment.count({
			where: {
				NOT: {
					parentId: null,
				},
			},
			cacheStrategy: {
				ttl: 120,
				swr: 10,
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
				equipment: {
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
			cacheStrategy: {
				ttl: 120,
				swr: 10,
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
