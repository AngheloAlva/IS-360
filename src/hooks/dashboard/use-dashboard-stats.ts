import { useQuery } from "@tanstack/react-query"

interface WorkOrderStats {
	total: number
	pending: number
	inProgress: number
	byType: Array<{
		type: string
		_count: number
	}>
}

interface CompanyStats {
	total: number
	usersDistribution: Array<{
		companyId: string
		_count: number
	}>
}

interface MaintenanceStats {
	totalPlans: number
	totalTasks: number
	tasksByFrequency: Array<{
		frequency: string
		_count: number
	}>
	upcomingTasks: Array<{
		id: string
		slug: string
		name: string
		nextDate: string
		equipment: {
			name: string
		}
	}>
}

interface DocumentStats {
	total: number
	byArea: Array<{
		area: string
		_count: number
	}>
}

export interface DashboardStatsResponse {
	workOrders: WorkOrderStats
	companies: CompanyStats
	maintenance: MaintenanceStats
	documents: DocumentStats
}

async function getDashboardStats(): Promise<DashboardStatsResponse> {
	const response = await fetch("/api/dashboard/stats")

	if (!response.ok) {
		throw new Error("Error al obtener las estadísticas del dashboard")
	}

	return response.json()
}

export function useDashboardStats() {
	return useQuery({
		queryKey: ["dashboard", "stats"],
		queryFn: getDashboardStats,
	})
}
