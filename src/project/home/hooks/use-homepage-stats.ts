import { useQuery } from "@tanstack/react-query"

export interface SystemOverview {
	companies: number
	equipment: number
	users: number
	workOrders: number
	permits: number
	maintenancePlans: number
	startupFolders: number
	activeUsers: number
	adminUsers: number
	operationalEquipment: number
	criticalEquipment: number
	inProgressWorkOrders: number
	criticalWorkOrders: number
	activePermits: number
	activeMaintenancePlans: number
	completedStartupFolders: number
	inProgressStartupFolders: number
	activeCompanies: number
	companiesWithPendingDocs: number
}

export interface ShapeChartItem {
	label: string
	value: string
}

export interface ModuleActivityItem {
	name: string
	percentage: number
}

export interface WeeklyActivityItem {
	day: string
	workOrders: number
	permits: number
	maintenance: number
	equipment: number
	users: number
	companies: number
	workRequests: number
	documentation: number
	vehicles: number
	startupFolders: number
}

export interface WorkOrderPieChartItem {
	name: string
	value: number
	status: string
}

export interface WorkRequestsAreaChartItem {
	month: string
	urgente: number
	noUrgente: number
}

export interface HomepageStatsResponse {
	systemOverview: SystemOverview
	shapeChart: ShapeChartItem[]
	moduleActivityChart: ModuleActivityItem[]
	weeklyActivityChart: WeeklyActivityItem[]
	workOrdersPieChart: WorkOrderPieChartItem[]
	workRequestsAreaChart: WorkRequestsAreaChartItem[]
}

async function getHomepageStats(): Promise<HomepageStatsResponse> {
	const response = await fetch("/api/dashboard/homepage-stats")

	if (!response.ok) {
		throw new Error("Error al obtener las estadísticas del dashboard")
	}

	return response.json()
}

export function useHomepageStats() {
	return useQuery({
		queryKey: ["dashboard", "homepage-stats"],
		queryFn: getHomepageStats,
	})
}
