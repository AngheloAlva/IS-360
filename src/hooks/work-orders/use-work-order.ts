import { QueryFunction, useQuery } from "@tanstack/react-query"
import { DateRange } from "react-day-picker"

interface WorkOrderStats {
	activeCount: number
	completedCount: number
	totalEntries: number
	avgProgress: number
}

export interface WorkOrder {
	id: string
	otNumber: string
	solicitationDate: string
	type: string
	status: string
	solicitationTime: string
	workRequest: string
	capex: string
	workDescription: string
	priority: string
	workProgressStatus: number
	initReport: {
		url: string
	} | null
	endReport: {
		url: string
	} | null
	programDate: Date
	estimatedHours: number | null
	estimatedDays: number | null
	estimatedEndDate: string | null
	equipment: {
		id: string
		name: string
	}
	company?: {
		id: string
		name: string
		logo: string | null
	}
	supervisor: {
		id: string
		name: string
		email: string
		role: string
	}
	responsible: {
		id: string
		name: string
		email: string
		role: string
	}
	_count: {
		workEntries: number
	}
}

interface WorkOrdersParams {
	page: number
	limit: number
	search: string
	typeFilter: string | null
	statusFilter: string | null
	companyId: string | null
	dateRange: DateRange | null
}

interface WorkOrdersResponse {
	workOrders: WorkOrder[]
	total: number
	pages: number
	stats: WorkOrderStats
}

export const fetchWorkOrders: QueryFunction<
	WorkOrdersResponse,
	readonly [
		"workOrders",
		{
			page: number
			limit: number
			search: string
			typeFilter: string | null
			statusFilter: string | null
			companyId: string | null
			dateRange: DateRange | null
		},
	]
> = async ({ queryKey }) => {
	const [, { page, limit, search, typeFilter, statusFilter, companyId, dateRange }] = queryKey

	const searchParams = new URLSearchParams()
	searchParams.set("page", page.toString())
	searchParams.set("limit", limit.toString())
	if (search) searchParams.set("search", search)
	if (typeFilter) searchParams.set("typeFilter", typeFilter)
	if (statusFilter) searchParams.set("statusFilter", statusFilter)
	if (companyId) searchParams.set("companyId", companyId)
	if (dateRange?.from) searchParams.set("startDate", dateRange.from.toISOString())
	if (dateRange?.to) searchParams.set("endDate", dateRange.to.toISOString())

	const res = await fetch(`/api/work-order?${searchParams.toString()}`)
	if (!res.ok) throw new Error("Error fetching work orders")

	return res.json()
}

export const useWorkOrders = ({
	page = 1,
	limit = 10,
	search = "",
	typeFilter = null,
	statusFilter = null,
	companyId = null,
	dateRange = null,
}: WorkOrdersParams) => {
	const queryKey = [
		"workOrders",
		{ page, limit, search, typeFilter, statusFilter, companyId, dateRange },
	] as const

	return useQuery<WorkOrdersResponse>({
		queryKey,
		queryFn: (fn) => fetchWorkOrders({ ...fn, queryKey }),
	})
}
