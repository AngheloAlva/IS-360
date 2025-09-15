"use client"

import { useQuery } from "@tanstack/react-query"
import { DateRange } from "react-day-picker"

export interface LockoutPermitStatsParams {
	companyId?: string | null
	dateRange?: DateRange | null
}

export interface LockoutPermitStatsResponse {
	overview: {
		total: number
		active: number
		pending: number
		completed: number
		rejected: number
	}
	percentages: {
		active: number
		pending: number
		completed: number
		rejected: number
	}
	byType: Array<{
		type: string
		count: number
	}>
	byMonth: Array<{
		month: Date
		count: number
	}>
}

const buildStatsUrlParams = (params: LockoutPermitStatsParams) => {
	const searchParams = new URLSearchParams()

	if (params.companyId) searchParams.append("companyId", params.companyId)
	if (params.dateRange?.from) {
		searchParams.append("dateFrom", encodeURIComponent(params.dateRange.from.toISOString()))
	}
	if (params.dateRange?.to) {
		searchParams.append("dateTo", encodeURIComponent(params.dateRange.to.toISOString()))
	}

	return searchParams.toString()
}

async function fetchLockoutPermitStats(
	params: LockoutPermitStatsParams
): Promise<LockoutPermitStatsResponse> {
	const urlParams = buildStatsUrlParams(params)
	const response = await fetch(`/api/lockout-permit/stats?${urlParams}`)

	if (!response.ok) {
		throw new Error("Network response was not ok")
	}

	return response.json()
}

export function useLockoutPermitStats(params: LockoutPermitStatsParams) {
	return useQuery({
		queryKey: ["lockout-permit-stats", params],
		queryFn: () => fetchLockoutPermitStats(params),
		staleTime: 1000 * 60 * 5, // 5 minutes
	})
}
