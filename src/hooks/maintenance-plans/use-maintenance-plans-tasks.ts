import { type QueryFunction, useQuery } from "@tanstack/react-query"

import type { PLAN_FREQUENCY } from "@prisma/client"

export interface MaintenancePlanTask {
	id: string
	name: string
	slug: string
	nextDate: Date
	createdAt: Date
	frequency: PLAN_FREQUENCY
	description: string
	createdBy: {
		name: string
	}
	equipment: {
		id: string
		name: string
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
}: UseMaintenancePlansTasksParams) => {
	return useQuery<MaintenancePlansTasksResponse>({
		queryKey: ["maintenance-plans-tasks", { page, limit, search, planSlug }],
		queryFn: (fn) =>
			fetchMaintenancePlanTasks({
				...fn,
				queryKey: ["maintenance-plans-tasks", { page, limit, search, planSlug }],
			}),
	})
}

export const fetchMaintenancePlanTasks: QueryFunction<
	MaintenancePlansTasksResponse,
	["maintenance-plans-tasks", { page: number; limit: number; search: string; planSlug: string }]
> = async ({ queryKey }) => {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [_, { page, limit, search, planSlug }]: [
		string,
		{ page: number; limit: number; search: string; planSlug: string },
	] = queryKey

	const searchParams = new URLSearchParams()
	searchParams.set("page", page.toString())
	searchParams.set("limit", limit.toString())
	if (search) searchParams.set("search", search)

	const res = await fetch(`/api/maintenance-plan/${planSlug}/tasks?${searchParams.toString()}`)
	if (!res.ok) throw new Error("Error fetching maintenance plans tasks")

	return res.json()
}
