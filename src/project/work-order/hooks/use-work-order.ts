import { QueryFunction, useQuery } from "@tanstack/react-query"
import { DateRange } from "react-day-picker"

import type {
	WORK_ORDER_TYPE,
	WORK_ORDER_STATUS,
	WORK_ORDER_PRIORITY,
} from "@/generated/prisma/enums"
import { useMemo } from "react"

export const WORK_ORDER_SORT_BY = {
	CREATED_AT: "createdAt",
	OT_NUMBER: "otNumber",
	WORK_REQUEST: "workRequest",
	STATUS: "status",
	PRIORITY: "priority",
	TYPE: "type",
	PROGRESS: "progress",
	SOLICITATION_DATE: "solicitationDate",
	PROGRAM_DATE: "programDate",
	COMPANY_NAME: "companyName",
	SUPERVISOR_NAME: "supervisorName",
} as const

export type WorkOrderSortBy = (typeof WORK_ORDER_SORT_BY)[keyof typeof WORK_ORDER_SORT_BY]
export type WorkOrderSortOrder = "asc" | "desc"

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
	rescheduledEndDate: Date | null
	programDate: Date
	equipments?: {
		id: string
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
		milestones: number
		workBookEntries: number
	}
}

interface WorkOrdersParams {
	page?: number
	order?: WorkOrderSortOrder
	limit?: number
	search?: string
	orderBy?: string
	sortBy?: WorkOrderSortBy
	sortOrder?: WorkOrderSortOrder
	pageSize?: number
	isInternalMember?: boolean
	permitFilter?: boolean
	companyId?: string | null
	responsibleId?: string | null
	typeFilter?: string | null
	includeEquipments?: boolean
	statusFilter?: string | null
	dateRange?: DateRange | null
	priorityFilter?: string | null
	onlyWithRequestClousure?: boolean
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
			order: WorkOrderSortOrder
			orderBy: string
			sortBy: WorkOrderSortBy
			sortOrder: WorkOrderSortOrder
			pageSize: number
			isInternalMember?: boolean
			permitFilter?: boolean
			companyId: string | null
			responsibleId: string | null
			typeFilter: string | null
			includeEquipments: boolean
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
			sortBy,
			sortOrder,
			pageSize,
			dateRange,
			companyId,
			responsibleId,
			typeFilter,
			isInternalMember,
			statusFilter,
			permitFilter,
			priorityFilter,
			includeEquipments,
			onlyWithRequestClousure,
		},
	] = queryKey

	const searchParams = new URLSearchParams()
	searchParams.set("page", page.toString())
	searchParams.set("limit", (pageSize || limit).toString())

	if (search) searchParams.set("search", search.trim())
	if (typeFilter) searchParams.set("typeFilter", typeFilter)
	if (statusFilter) searchParams.set("statusFilter", statusFilter)
	if (companyId) searchParams.set("companyId", companyId)
	if (responsibleId) searchParams.set("responsibleId", responsibleId)
	if (dateRange?.from) searchParams.set("startDate", dateRange.from.toISOString())
	if (dateRange?.to) searchParams.set("endDate", dateRange.to.toISOString())
	if (permitFilter) searchParams.set("permitFilter", "true")
	if (sortBy) searchParams.set("sortBy", sortBy)
	if (sortOrder) searchParams.set("sortOrder", sortOrder)
	if (orderBy) searchParams.set("orderBy", orderBy)
	if (order) searchParams.set("order", order)
	if (isInternalMember) searchParams.set("isInternalMember", isInternalMember.toString())
	if (priorityFilter) searchParams.set("priorityFilter", priorityFilter)
	if (onlyWithRequestClousure) {
		searchParams.set("onlyWithRequestClousure", onlyWithRequestClousure.toString())
	}
	if (includeEquipments) {
		searchParams.set("includeEquipments", includeEquipments.toString())
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

		return {
			...data,
			workOrders: data.workOrders.map((wo: WorkOrder) => ({
				...wo,
				solicitationDate: new Date(wo.solicitationDate),
				programDate: new Date(wo.programDate),
				estimatedEndDate: wo.estimatedEndDate ? new Date(wo.estimatedEndDate) : null,
				rescheduledEndDate: wo.rescheduledEndDate ? new Date(wo.rescheduledEndDate) : null,
			})),
		} satisfies WorkOrdersResponse
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
	pageSize,
	sortBy = "createdAt",
	sortOrder,
	priorityFilter = null,
	companyId = null,
	responsibleId = null,
	dateRange = null,
	typeFilter = null,
	isInternalMember = false,
	statusFilter = null,
	permitFilter = false,
	orderBy = "createdAt",
	includeEquipments = false,
	onlyWithRequestClousure = false,
}: WorkOrdersParams) => {
	const resolvedSortOrder = sortOrder ?? order
	const resolvedSortBy =
		sortBy ?? (orderBy === "name" ? WORK_ORDER_SORT_BY.WORK_REQUEST : WORK_ORDER_SORT_BY.CREATED_AT)
	const resolvedPageSize = pageSize ?? limit

	const queryKey = useMemo(
		() =>
			[
				"workOrders",
				{
					page,
					limit: resolvedPageSize,
					order: resolvedSortOrder,
					orderBy,
					sortBy: resolvedSortBy,
					sortOrder: resolvedSortOrder,
					pageSize: resolvedPageSize,
					dateRange,
					companyId,
					responsibleId,
					typeFilter,
					isInternalMember,
					statusFilter,
					permitFilter,
					priorityFilter,
					includeEquipments,
					search: search.trim(),
					onlyWithRequestClousure,
				},
			] as const,
		[
			page,
			resolvedPageSize,
			resolvedSortOrder,
			search,
			orderBy,
			resolvedSortBy,
			dateRange,
			companyId,
			responsibleId,
			typeFilter,
			isInternalMember,
			statusFilter,
			permitFilter,
			priorityFilter,
			includeEquipments,
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
