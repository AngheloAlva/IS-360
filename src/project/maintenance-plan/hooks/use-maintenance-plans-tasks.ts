import { type QueryFunction, useQuery } from "@tanstack/react-query"

import type {
	PLAN_FREQUENCY,
	WORK_ORDER_TYPE,
	WORK_ORDER_CAPEX,
	WORK_ORDER_PRIORITY,
} from "@prisma/client"

export interface MaintenancePlanTask {
	id: string
	name: string
	slug: string
	nextDate: Date
	createdAt: Date
	description: string
	isAutomated: boolean
	frequency: PLAN_FREQUENCY
	automatedSupervisorId: string
	automatedEstimatedDays: number
	automatedEstimatedHours: number
	automatedCapex: WORK_ORDER_CAPEX
	automatedWorkDescription: string
	automatedPriority: WORK_ORDER_PRIORITY
	automatedWorkOrderType: WORK_ORDER_TYPE
	createdBy: {
		id: string
		name: string
	}
	equipment: {
		id: string
		tag: string
		name: string
		location: string
	}
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
	nextDateFrom?: string
	nextDateTo?: string
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
	nextDateFrom = "",
	nextDateTo = "",
}: UseMaintenancePlansTasksParams) => {
	return useQuery<MaintenancePlansTasksResponse>({
		queryKey: [
			"maintenance-plans-tasks",
			{ page, limit, search, planSlug, frequency, nextDateFrom, nextDateTo },
		],
		queryFn: (fn) =>
			fetchMaintenancePlanTasks({
				...fn,
				queryKey: [
					"maintenance-plans-tasks",
					{ page, limit, search, planSlug, frequency, nextDateFrom, nextDateTo },
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
			nextDateFrom: string
			nextDateTo: string
		},
	]
> = async ({ queryKey }) => {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [_, { page, limit, search, planSlug, frequency, nextDateFrom, nextDateTo }]: [
		string,
		{
			page: number
			limit: number
			search: string
			planSlug: string
			frequency: string
			nextDateFrom: string
			nextDateTo: string
		},
	] = queryKey

	const searchParams = new URLSearchParams()
	searchParams.set("page", page.toString())
	searchParams.set("limit", limit.toString())
	if (search) searchParams.set("search", search)
	if (frequency) searchParams.set("frequency", frequency)
	if (nextDateFrom) searchParams.set("nextDateFrom", nextDateFrom)
	if (nextDateTo) searchParams.set("nextDateTo", nextDateTo)

	const res = await fetch(`/api/maintenance-plan/${planSlug}/tasks?${searchParams.toString()}`)
	if (!res.ok) throw new Error("Error fetching maintenance plans tasks")

	return res.json()
}
