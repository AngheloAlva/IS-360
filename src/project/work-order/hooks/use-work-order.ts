import { QueryFunction, useQuery } from "@tanstack/react-query"
import { DateRange } from "react-day-picker"

import type { WORK_ORDER_TYPE, WORK_ORDER_STATUS, WORK_ORDER_PRIORITY } from "@prisma/client"
import type { Order, OrderBy } from "@/shared/components/OrderByButton"
import { useMemo } from "react"

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
	workRequest: string
	estimatedHours: number
	estimatedDays: number
	priority: WORK_ORDER_PRIORITY
	progress: number
	estimatedEndDate: Date | null
	programDate: Date
	equipments?: {
		name: string
	}[]
	company?: {
		id: string
		rut: string
		name: string
		image: string | null
	}
	supervisor: {
		id: string
		rut: string
		name: string
		email: string
		phone: string | null
		image: string | null
	}
	_count: {
		workBookEntries: number
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
	priorityFilter: string | null
	onlyWithRequestClousure: boolean
}

interface WorkOrdersResponse {
	total: number
	pages: number
	stats: WorkOrderStats
	workOrders: WorkOrder[]
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
			priorityFilter: string | null
			onlyWithRequestClousure: boolean
		},
	]
> = async ({ queryKey, signal }) => {
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
			priorityFilter,
			onlyWithRequestClousure,
		},
	] = queryKey

	const searchParams = new URLSearchParams()
	searchParams.set("page", page.toString())
	searchParams.set("limit", limit.toString())

	if (search) searchParams.set("search", search.trim())
	if (typeFilter) searchParams.set("typeFilter", typeFilter)
	if (statusFilter) searchParams.set("statusFilter", statusFilter)
	if (companyId) searchParams.set("companyId", companyId)
	if (dateRange?.from) searchParams.set("startDate", dateRange.from.toISOString())
	if (dateRange?.to) searchParams.set("endDate", dateRange.to.toISOString())
	if (permitFilter) searchParams.set("permitFilter", "true")
	if (orderBy) searchParams.set("orderBy", orderBy)
	if (order) searchParams.set("order", order)
	if (isOtcMember) searchParams.set("isOtcMember", isOtcMember.toString())
	if (priorityFilter) searchParams.set("priorityFilter", priorityFilter)
	if (onlyWithRequestClousure) {
		searchParams.set("onlyWithRequestClousure", onlyWithRequestClousure.toString())
	}

	try {
		const res = await fetch(`/api/work-order?${searchParams.toString()}`, {
			signal,
		})

		if (!res.ok) throw new Error("Error fetching work orders")

		const data = await res.json()

		if (!data || typeof data !== "object") {
			throw new Error("Invalid response format")
		}

		return data
	} catch (error) {
		if (error instanceof Error && error.name === "AbortError") {
			throw new Error("Request was cancelled")
		}

		throw error
	}
}

export const useWorkOrders = ({
	page = 1,
	limit = 10,
	search = "",
	order = "desc",
	priorityFilter,
	companyId = null,
	dateRange = null,
	typeFilter = null,
	isOtcMember = false,
	statusFilter = null,
	permitFilter = false,
	orderBy = "createdAt",
	onlyWithRequestClousure,
}: WorkOrdersParams) => {
	const queryKey = useMemo(
		() =>
			[
				"workOrders",
				{
					page,
					limit,
					order,
					orderBy,
					dateRange,
					companyId,
					typeFilter,
					isOtcMember,
					statusFilter,
					permitFilter,
					priorityFilter,
					search: search.trim(),
					onlyWithRequestClousure,
				},
			] as const,
		[
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
			priorityFilter,
			onlyWithRequestClousure,
		]
	)

	return useQuery<WorkOrdersResponse>({
		queryKey,
		queryFn: (fn) => fetchWorkOrders({ ...fn, queryKey }),
		staleTime: 1000 * 60 * 2,
		refetchOnWindowFocus: false,
		refetchOnMount: false,
	})
}
