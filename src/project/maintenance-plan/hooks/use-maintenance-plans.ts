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
		location: string
	}
	createdAt: Date
	createdBy: {
		name: string
	}
	nextWeekTasksCount: number
	expiredTasksCount: number
}

interface UseMaintenancePlansParams {
	page?: number
	order?: Order
	limit?: number
	search?: string
	orderBy?: OrderBy
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
}: UseMaintenancePlansParams = {}) => {
	return useQuery<MaintenancePlansResponse>({
		queryKey: ["maintenance-plans", { page, limit, search, order, orderBy }],
		queryFn: (fn) =>
			fetchMaintenancePlans({
				...fn,
				queryKey: ["maintenance-plans", { page, limit, search, order, orderBy }],
			}),
	})
}

export const fetchMaintenancePlans: QueryFunction<
	MaintenancePlansResponse,
	[
		"maintenance-plans",
		{ page: number; limit: number; search: string; order: Order; orderBy: OrderBy },
	]
> = async ({ queryKey }) => {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [_, { page, limit, search, order, orderBy }]: [
		string,
		{ page: number; limit: number; search: string; order: Order; orderBy: OrderBy },
	] = queryKey

	const searchParams = new URLSearchParams()
	searchParams.set("page", page.toString())
	searchParams.set("limit", limit.toString())
	if (search) searchParams.set("search", search)
	if (order) searchParams.set("order", order)
	if (orderBy) searchParams.set("orderBy", orderBy)

	const res = await fetch(`/api/maintenance-plan?${searchParams.toString()}`)
	if (!res.ok) throw new Error("Error fetching maintenance plans")

	return res.json()
}
