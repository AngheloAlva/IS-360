import { useQuery } from "@tanstack/react-query"

// Interface for system overview data (estructura plana como lo devuelve la API)
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

// Interface for system health data (ShapeChart)
export interface ShapeChartItem {
	label: string
	value: string
}

// Interface for module activity data
export interface ModuleActivityItem {
	name: string
	percentage: number
}

// Interface for weekly activity data
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

// Interface for recent activity data
export interface RecentActivityItem {
	id: string
	description: string
	module: string
	time: string
	user: string
}

// Interface for the complete homepage stats response
export interface HomepageStatsResponse {
	systemOverview: SystemOverview
	shapeChart: ShapeChartItem[]
	moduleActivityChart: ModuleActivityItem[]
	weeklyActivityChart: WeeklyActivityItem[]
	recentActivity: RecentActivityItem[]
}

// Function to fetch homepage stats from the API
async function getHomepageStats(): Promise<HomepageStatsResponse> {
	const response = await fetch("/api/dashboard/homepage-stats")

	if (!response.ok) {
		throw new Error("Error al obtener las estadísticas del dashboard")
	}

	// La respuesta ya está en formato compatible con HomepageStatsResponse
	return response.json()
}

// Custom hook for fetching homepage stats
export function useHomepageStats() {
	return useQuery({
		queryKey: ["dashboard", "homepage-stats"],
		queryFn: getHomepageStats,
	})
}
