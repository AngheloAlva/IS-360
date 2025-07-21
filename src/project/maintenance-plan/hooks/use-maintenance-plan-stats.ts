import { useQuery } from "@tanstack/react-query"

import type { PLAN_FREQUENCY, WORK_ORDER_PRIORITY } from "@prisma/client"

export interface MaintenancePlanBasicStats {
	totalPlans: number
	totalTasks: number
	tasksWithUpcomingDate: number
	tasksWithOverdueDate: number
}

export interface PieChartItem {
	name: string
	value: number
	frequency: PLAN_FREQUENCY
}

export interface BarChartItem {
	name: string
	value: number
	fill: string
	priority: WORK_ORDER_PRIORITY
}

export interface AreaChartItem {
	date: string
	tasks: number
}

export interface MaintenancePlanStatsResponse {
	basicStats: MaintenancePlanBasicStats
	pieChartData: PieChartItem[]
	barChartData: BarChartItem[]
	areaChartData: AreaChartItem[]
}

export const useMaintenancePlanStats = () => {
	return useQuery<MaintenancePlanStatsResponse>({
		queryKey: ["maintenancePlanStats"],
		queryFn: fetchMaintenancePlanStats,
	})
}

export const fetchMaintenancePlanStats = async (): Promise<MaintenancePlanStatsResponse> => {
	const response = await fetch("/api/maintenance-plan/stats")

	if (!response.ok) {
		throw new Error("Error fetching maintenance plan stats")
	}

	return response.json()
}
