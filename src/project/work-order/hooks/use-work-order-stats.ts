import { useQuery } from "@tanstack/react-query"

import type { DateRange } from "react-day-picker"

interface WorkOrderCard {
	total: number
	planned: number
	inProgress: number
	completed: number
}

interface ChartItem {
	name: string
	value: number
}

interface MonthlyWorkOrder {
	month: number
	count: number
}

interface RecentWorkOrder {
	id: string
	otNumber: string
	status: string
	priority: string
	createdAt: string
	workName: string | null
	workProgressStatus: number | null
	company: {
		name: string
	} | null
}

interface WorkOrderCharts {
	priority: ChartItem[]
	type: ChartItem[]
	companies: ChartItem[]
	monthly: MonthlyWorkOrder[]
	averageProgress: number
}

export interface WorkOrderStatsResponse {
	cards: WorkOrderCard
	charts: WorkOrderCharts
	recentWorkOrders: RecentWorkOrder[]
}

interface WorkOrderStatsParams {
	statusFilter?: string | null
	priorityFilter?: string | null
	typeFilter?: string | null
	companyId?: string | null
	dateRange?: DateRange | null
	search?: string
	onlyWithRequestClousure?: boolean
}

async function fetchWorkOrderStats(
	params: WorkOrderStatsParams = {}
): Promise<WorkOrderStatsResponse> {
	// Construir URL con parámetros de filtro
	const searchParams = new URLSearchParams()

	if (params.statusFilter) searchParams.set("statusFilter", params.statusFilter)
	if (params.priorityFilter) searchParams.set("priorityFilter", params.priorityFilter)
	if (params.typeFilter) searchParams.set("typeFilter", params.typeFilter)
	if (params.companyId) searchParams.set("companyId", params.companyId)
	if (params.search) searchParams.set("search", params.search)
	if (params.onlyWithRequestClousure) searchParams.set("onlyWithRequestClousure", "true")

	// Añadir fechas del rango si existe
	if (params.dateRange?.from) {
		searchParams.set("startDate", params.dateRange.from.toISOString())
	}
	if (params.dateRange?.to) {
		searchParams.set("endDate", params.dateRange.to.toISOString())
	}

	const queryString = searchParams.toString()
	const url = `/api/work-order/stats${queryString ? `?${queryString}` : ""}`

	const response = await fetch(url)

	if (!response.ok) {
		throw new Error("Error al obtener las estadísticas de órdenes de trabajo")
	}

	return response.json()
}

export function useWorkOrderStats(params: WorkOrderStatsParams = {}) {
	return useQuery({
		queryKey: ["work-order-stats", params],
		queryFn: () => fetchWorkOrderStats(params),
		refetchOnWindowFocus: false,
		refetchInterval: 5 * 60 * 1000, // 5 minutos
	})
}
