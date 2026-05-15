import { type QueryFunction, useQuery } from "@tanstack/react-query"

import type {
	MaintenanceTaskOrder,
	MaintenanceTaskOrderBy,
} from "../components/data/MaintenanceTaskOrderByButton"
import type {
	PLAN_FREQUENCY,
	TASK_SPECIALTY,
	TASK_TYPE,
	WORK_ORDER_TYPE,
	WORK_ORDER_CAPEX,
	WORK_ORDER_PRIORITY,
} from "@/generated/prisma/enums"

export interface MaintenancePlanTask {
	id: string
	name: string
	slug: string
	nextDate: Date
	createdAt: Date
	description: string
	isAutomated: boolean
	emailsForCopy: string[]
	frequency: PLAN_FREQUENCY
	specialty: TASK_SPECIALTY | null
	taskType: TASK_TYPE | null
	automatedCompanyId: string
	automatedResponsibleId: string
	automatedSupervisorId: string
	automatedEstimatedDays: number
	automatedEstimatedDaysByMonth: boolean
	automatedDaysInAdvance: number
	automatedEstimatedHours: number
	automatedCapex: WORK_ORDER_CAPEX
	automatedWorkDescription: string
	automatedPriority: WORK_ORDER_PRIORITY
	automatedWorkOrderType: WORK_ORDER_TYPE
	blockIfPreviousNotCompleted: boolean
	createdBy: {
		id: string
		name: string
	}
	equipment: {
		id: string
		tag: string
		name: string
		location: { id: string; name: string; path: string }
	}
	equipments: {
		id: string
		tag: string
		name: string
		location: { id: string; name: string; path: string }
	}[]
	attachments: {
		id: string
		name: string
		url: string
	}[]
	_count: {
		workOrders: number
	}
}

interface UseMaintenancePlansTasksParams {
	page?: number
	limit?: number
	search?: string
	planSlug: string
	frequency?: string
	isAutomated?: "all" | "automated" | "manual"
	nextDateFrom?: string
	nextDateTo?: string
	order?: MaintenanceTaskOrder
	orderBy?: MaintenanceTaskOrderBy
}

interface MaintenancePlansTasksResponse {
	tasks: MaintenancePlanTask[]
	total: number
	pages: number
}

export const useMaintenancePlanTasks = ({
	planSlug,
	page = 1,
	limit = 10,
	search = "",
	frequency = "",
	isAutomated = "all",
	nextDateFrom = "",
	nextDateTo = "",
	order = "asc",
	orderBy = "createdAt",
}: UseMaintenancePlansTasksParams) => {
	return useQuery<MaintenancePlansTasksResponse>({
		enabled: !!planSlug,
		queryKey: [
			"maintenance-plans-tasks",
			{
				page,
				limit,
				search,
				planSlug,
				frequency,
				isAutomated,
				nextDateFrom,
				nextDateTo,
				order,
				orderBy,
			},
		],
		queryFn: (fn) =>
			fetchMaintenancePlanTasks({
				...fn,
				queryKey: [
					"maintenance-plans-tasks",
					{
						page,
						limit,
						search,
						planSlug,
						frequency,
						isAutomated,
						nextDateFrom,
						nextDateTo,
						order,
						orderBy,
					},
				],
			}),
	})
}

export const fetchMaintenancePlanTasks: QueryFunction<
	MaintenancePlansTasksResponse,
	[
		"maintenance-plans-tasks",
		{
			page: number
			limit: number
			search: string
			planSlug: string
			frequency: string
			isAutomated: "all" | "automated" | "manual"
			nextDateFrom: string
			nextDateTo: string
			order: MaintenanceTaskOrder
			orderBy: MaintenanceTaskOrderBy
		},
	]
> = async ({ queryKey }) => {
	const [
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		_,
		{
			page,
			limit,
			search,
			planSlug,
			frequency,
			isAutomated,
			nextDateFrom,
			nextDateTo,
			order,
			orderBy,
		},
	]: [
		string,
		{
			page: number
			limit: number
			search: string
			planSlug: string
			frequency: string
			isAutomated: "all" | "automated" | "manual"
			nextDateFrom: string
			nextDateTo: string
			order: MaintenanceTaskOrder
			orderBy: MaintenanceTaskOrderBy
		},
	] = queryKey

	const searchParams = new URLSearchParams()
	searchParams.set("page", page.toString())
	searchParams.set("limit", limit.toString())
	if (search) searchParams.set("search", search)
	if (frequency) searchParams.set("frequency", frequency)
	if (isAutomated !== "all") searchParams.set("isAutomated", isAutomated)
	if (nextDateFrom) searchParams.set("nextDateFrom", nextDateFrom)
	if (nextDateTo) searchParams.set("nextDateTo", nextDateTo)
	if (order) searchParams.set("order", order)
	if (orderBy) searchParams.set("orderBy", orderBy)

	const res = await fetch(`/api/maintenance-plan/${planSlug}/tasks?${searchParams.toString()}`)
	if (!res.ok) throw new Error("Error fetching maintenance plans tasks")

	return res.json()
}
