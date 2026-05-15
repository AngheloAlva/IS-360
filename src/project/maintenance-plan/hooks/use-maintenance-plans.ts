import { type QueryFunction, useQuery } from "@tanstack/react-query"

import type { Order, OrderBy } from "@/shared/components/OrderByButton"

export interface MaintenancePlan {
	id: string
	name: string
	slug: string
	equipment: {
		id: string
		name: string
		tag: string
		location: { id: string; name: string; path: string }
	}
	createdAt: Date
	createdBy: {
		id: string
		name: string
	}
	nextWeekTasksCount: number
	expiredTasksCount: number
	task?: {
		id: string
		name: string
		nextDate: Date
		equipment: {
			id: string
			name: string
		}
		equipments: {
			id: string
			name: string
			location: { id: string; name: string; path: string }
		}[]
	}[]
}

interface UseMaintenancePlansParams {
	page?: number
	order?: Order
	limit?: number
	search?: string
	orderBy?: OrderBy
	enabled?: boolean
	includeTasks?: boolean
	alertFilter?: "all" | "withOverdue" | "withUpcoming" | "withAlerts" | "withoutAlerts"
}

interface MaintenancePlansResponse {
	maintenancePlans: MaintenancePlan[]
	total: number
	pages: number
}

export const useMaintenancePlans = ({
	page = 1,
	limit = 10,
	search = "",
	order = "asc",
	orderBy = "name",
	enabled = true,
	includeTasks = false,
	alertFilter = "all",
}: UseMaintenancePlansParams = {}) => {
	return useQuery<MaintenancePlansResponse>({
		enabled,
		queryKey: [
			"maintenance-plans",
			{ page, limit, search, order, orderBy, includeTasks, alertFilter },
		],
		queryFn: (fn) =>
			fetchMaintenancePlans({
				...fn,
				queryKey: [
					"maintenance-plans",
					{ page, limit, search, order, orderBy, includeTasks, alertFilter },
				],
			}),
	})
}

export const fetchMaintenancePlans: QueryFunction<
	MaintenancePlansResponse,
	[
		"maintenance-plans",
		{
			page: number
			limit: number
			search: string
			order: Order
			orderBy: OrderBy
			includeTasks: boolean
			alertFilter: "all" | "withOverdue" | "withUpcoming" | "withAlerts" | "withoutAlerts"
		},
	]
> = async ({ queryKey }) => {
	const [_, { page, limit, search, order, orderBy, includeTasks, alertFilter }]: [
		string,
		{
			page: number
			limit: number
			search: string
			order: Order
			orderBy: OrderBy
			includeTasks: boolean
			alertFilter: "all" | "withOverdue" | "withUpcoming" | "withAlerts" | "withoutAlerts"
		},
	] = queryKey

	const searchParams = new URLSearchParams()
	searchParams.set("page", page.toString())
	searchParams.set("limit", limit.toString())
	if (search) searchParams.set("search", search)
	if (order) searchParams.set("order", order)
	if (orderBy) searchParams.set("orderBy", orderBy)
	if (includeTasks) searchParams.set("includeTasks", "true")
	if (alertFilter !== "all") searchParams.set("alertFilter", alertFilter)

	const res = await fetch(`/api/maintenance-plan?${searchParams.toString()}`)
	if (!res.ok) throw new Error("Error fetching maintenance plans")

	return res.json()
}
