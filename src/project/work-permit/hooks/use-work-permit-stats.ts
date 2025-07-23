import { useQuery } from "@tanstack/react-query"

interface WorkPermitStats {
	totalWorkPermits: number
	workPermitsByStatus: {
		status: string
		count: number
		fill: string
	}[]
	workPermitsByType: {
		type: string
		count: number
	}[]
	activeWorkPermitsByCompany: {
		companyId: string
		companyName: string
		count: number
	}[]
	activityData: {
		date: string
		count: number
	}[]
}

interface WorkPermitStatsParams {
	search?: string
	date?: Date | null
	companyId?: string | null
	approvedBy?: string | null
	typeFilter?: string | null
	statusFilter?: string | null
}

export function useWorkPermitStats(params: WorkPermitStatsParams = {}) {
	const { search = "", statusFilter, companyId, approvedBy, typeFilter, date } = params

	const searchParams = new URLSearchParams()
	if (search) searchParams.set("search", search)
	if (companyId) searchParams.set("companyId", companyId)
	if (date) searchParams.set("date", date?.toISOString())
	if (approvedBy) searchParams.set("approvedBy", approvedBy)
	if (typeFilter) searchParams.set("typeFilter", typeFilter)
	if (statusFilter) searchParams.set("statusFilter", statusFilter)

	return useQuery<WorkPermitStats>({
		queryKey: [
			"work-permit-stats",
			{ search, statusFilter, companyId, approvedBy, typeFilter, date },
		],
		queryFn: async () => {
			const url = `/api/work-permit/stats${searchParams.toString() ? `?${searchParams.toString()}` : ""}`
			const response = await fetch(url)
			if (!response.ok) {
				throw new Error("Failed to fetch work permit stats")
			}
			return response.json()
		},
	})
}
