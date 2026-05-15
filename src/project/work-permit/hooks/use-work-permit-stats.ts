import { useQuery } from "@tanstack/react-query"
import type { DateRange } from "react-day-picker"

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
	dateRange?: DateRange | null
	companyId?: string | null
	approvedBy?: string | null
	typeFilter?: string | null
	statusFilter?: string | null
}

export function useWorkPermitStats(params: WorkPermitStatsParams = {}) {
	const { search = "", statusFilter, companyId, approvedBy, typeFilter, dateRange } = params

	const searchParams = new URLSearchParams()
	if (search) searchParams.set("search", search)
	if (companyId) searchParams.set("companyId", companyId)
	// TODO: Fix problem with toISOString()
	if (dateRange?.from) searchParams.set("dateFrom", `${dateRange.from}`)
	if (dateRange?.to) searchParams.set("dateTo", `${dateRange.to}`)
	if (approvedBy) searchParams.set("approvedBy", approvedBy)
	if (typeFilter) searchParams.set("typeFilter", typeFilter)
	if (statusFilter) searchParams.set("statusFilter", statusFilter)

	return useQuery<WorkPermitStats>({
		queryKey: [
			"work-permit-stats",
			{ search, statusFilter, companyId, approvedBy, typeFilter, dateRange },
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
