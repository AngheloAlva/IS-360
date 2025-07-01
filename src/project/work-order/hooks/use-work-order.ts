import { QueryFunction, useQuery } from "@tanstack/react-query"
import { DateRange } from "react-day-picker"

import type {
	WORK_ORDER_TYPE,
	WORK_ORDER_CAPEX,
	WORK_ORDER_STATUS,
	WORK_ORDER_PRIORITY,
} from "@prisma/client"
import { Order, OrderBy } from "@/shared/components/OrderByButton"

interface WorkOrderStats {
	activeCount: number
	completedCount: number
	totalEntries: number
	avgProgress: number
}

export interface WorkOrder {
	id: string
	otNumber: string
	solicitationDate: Date
	type: WORK_ORDER_TYPE
	status: WORK_ORDER_STATUS
	solicitationTime: string
	workRequest: string
	createdAt: Date
	capex: WORK_ORDER_CAPEX
	workDescription: string
	priority: WORK_ORDER_PRIORITY
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
	estimatedEndDate: Date | null
	equipment: {
		id: string
		name: string
	}[]
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
	order: Order
	limit: number
	search: string
	orderBy: OrderBy
	isOtcMember?: boolean
	permitFilter?: boolean
	companyId: string | null
	typeFilter: string | null
	statusFilter: string | null
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
			order: Order
			orderBy: OrderBy
			isOtcMember?: boolean
			permitFilter?: boolean
			companyId: string | null
			typeFilter: string | null
			statusFilter: string | null
			dateRange: DateRange | null
		},
	]
> = async ({ queryKey }) => {
	const [
		,
		{
			page,
			limit,
			order,
			search,
			orderBy,
			dateRange,
			companyId,
			typeFilter,
			isOtcMember,
			statusFilter,
			permitFilter,
		},
	] = queryKey

	const searchParams = new URLSearchParams()
	searchParams.set("page", page.toString())
	searchParams.set("limit", limit.toString())
	if (search) searchParams.set("search", search)
	if (typeFilter) searchParams.set("typeFilter", typeFilter)
	if (statusFilter) searchParams.set("statusFilter", statusFilter)
	if (companyId) searchParams.set("companyId", companyId)
	if (dateRange?.from) searchParams.set("startDate", dateRange.from.toISOString())
	if (dateRange?.to) searchParams.set("endDate", dateRange.to.toISOString())
	if (permitFilter) searchParams.set("permitFilter", "true")
	if (orderBy) searchParams.set("orderBy", orderBy)
	if (order) searchParams.set("order", order)
	if (isOtcMember) searchParams.set("isOtcMember", isOtcMember.toString())

	const res = await fetch(`/api/work-order?${searchParams.toString()}`)
	if (!res.ok) throw new Error("Error fetching work orders")

	return res.json()
}

export const useWorkOrders = ({
	page = 1,
	limit = 10,
	search = "",
	order = "desc",
	companyId = null,
	dateRange = null,
	typeFilter = null,
	statusFilter = null,
	permitFilter = false,
	orderBy = "createdAt",
	isOtcMember = false,
}: WorkOrdersParams) => {
	const queryKey = [
		"workOrders",
		{
			page,
			limit,
			order,
			search,
			orderBy,
			dateRange,
			companyId,
			typeFilter,
			isOtcMember,
			statusFilter,
			permitFilter,
		},
	] as const

	return useQuery<WorkOrdersResponse>({
		queryKey,
		queryFn: (fn) => fetchWorkOrders({ ...fn, queryKey }),
	})
}
