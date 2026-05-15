import { useQuery } from "@tanstack/react-query"

export interface MaintenancePlanMonthlyStat {
	name: string
	date: string
	value: number
}

export interface MaintenancePlanHealthStats {
	totalTasks: number
	overdueTasks: number
	tasksNext7Days: number
	planHealthScore: number
	completionRateLast30Days: number
	totalWorkOrdersLast30Days: number
	completedWorkOrdersLast30Days: number
}

export interface MaintenancePlanRiskTask {
	id: string
	name: string
	nextDate: Date
	daysOverdue: number
	equipmentName: string
	equipmentLocation: string
	workOrdersCount: number
}

export interface MaintenancePlanRiskStats {
	level: "low" | "medium" | "high"
	overdueTasksWithoutActiveOrder: number
	tasks: MaintenancePlanRiskTask[]
}

export interface MaintenancePlanSpecificStatsResponse {
	monthlyStats: MaintenancePlanMonthlyStat[]
	health: MaintenancePlanHealthStats
	risk: MaintenancePlanRiskStats
}

export const useMaintenancePlanSpecificStats = ({ planSlug }: { planSlug: string }) => {
	return useQuery<MaintenancePlanSpecificStatsResponse>({
		queryKey: ["maintenancePlanSpecificStats", planSlug],
		queryFn: () => fetchMaintenancePlanSpecificStats(planSlug),
	})
}

export const fetchMaintenancePlanSpecificStats = async (
	planSlug: string
): Promise<MaintenancePlanSpecificStatsResponse> => {
	const response = await fetch(`/api/maintenance-plan/${planSlug}/stats`)

	if (!response.ok) {
		throw new Error("Error fetching maintenance plan specific stats")
	}

	return response.json()
}
