import { useQuery } from "@tanstack/react-query"

export interface MaintenancePlan {
	id: string
	name: string
	slug: string
	description: string
	equipment: {
		name: string
		tag: string
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
		queryFn: async () => {
			const searchParams = new URLSearchParams()
			searchParams.set("page", page.toString())
			searchParams.set("limit", limit.toString())
			if (search) searchParams.set("search", search)

			const res = await fetch(`/api/maintenance-plan?${searchParams.toString()}`)
			if (!res.ok) throw new Error("Error fetching maintenance plans")

			return res.json()
		},
	})
}
