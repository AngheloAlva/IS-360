"use client"

import { useQuery } from "@tanstack/react-query"

interface WorkBookEntriesData {
	month: string
	dailyActivity: number
	additionalActivity: number
	inspection: number
}

export const useWorkBookEntriesChart = () => {
	return useQuery<WorkBookEntriesData[]>({
		queryKey: ["workBookEntriesChart"],
		queryFn: async () => {
			const res = await fetch("/api/work-book/stats/entries")
			if (!res.ok) throw new Error("Error fetching work book entries chart data")
			return res.json()
		},
	})
}
