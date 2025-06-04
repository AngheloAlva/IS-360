import { type QueryFunction, useQuery } from "@tanstack/react-query"

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
	_count: {
		task: number
	}
}

interface UseMaintenancePlansParams {
	page?: number
	limit?: number
	search?: string
	location?: string
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
	location = "",
}: UseMaintenancePlansParams = {}) => {
	return useQuery<MaintenancePlansResponse>({
		queryKey: ["maintenance-plans", { page, limit, search, location }],
		queryFn: (fn) =>
			fetchMaintenancePlans({
				...fn,
				queryKey: ["maintenance-plans", { page, limit, search, location }],
			}),
	})
}

export const fetchMaintenancePlans: QueryFunction<
	MaintenancePlansResponse,
	["maintenance-plans", { page: number; limit: number; search: string; location: string }]
> = async ({ queryKey }) => {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [_, { page, limit, search, location }]: [
		string,
		{ page: number; limit: number; search: string; location: string },
	] = queryKey

	const searchParams = new URLSearchParams()
	searchParams.set("page", page.toString())
	searchParams.set("limit", limit.toString())
	if (search) searchParams.set("search", search)
	if (location) searchParams.set("location", location)

	const res = await fetch(`/api/maintenance-plan?${searchParams.toString()}`)
	if (!res.ok) throw new Error("Error fetching maintenance plans")

	return res.json()
}
