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
}: UseMaintenancePlansParams = {}) => {
	return useQuery<MaintenancePlansResponse>({
		queryKey: ["maintenance-plans", { page, limit, search }],
		queryFn: (fn) =>
			fetchMaintenancePlans({
				...fn,
				queryKey: ["maintenance-plans", { page, limit, search }],
			}),
	})
}

export const fetchMaintenancePlans: QueryFunction<
	MaintenancePlansResponse,
	["maintenance-plans", { page: number; limit: number; search: string }]
> = async ({ queryKey }) => {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [_, { page, limit, search }]: [string, { page: number; limit: number; search: string }] =
		queryKey

	const searchParams = new URLSearchParams()
	searchParams.set("page", page.toString())
	searchParams.set("limit", limit.toString())
	if (search) searchParams.set("search", search)

	const res = await fetch(`/api/maintenance-plan?${searchParams.toString()}`)
	if (!res.ok) throw new Error("Error fetching maintenance plans")

	return res.json()
}
