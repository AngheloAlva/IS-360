"use client"

import { useQuery } from "@tanstack/react-query"

interface WorkBookStatusData {
	status: string
	count: number
	fill: string
}

export const useWorkBookStatusChart = () => {
	return useQuery<WorkBookStatusData[]>({
		queryKey: ["workBookStatusChart"],
		queryFn: async () => {
			const res = await fetch("/api/work-book/stats/status")
			if (!res.ok) throw new Error("Error fetching work book status chart data")
			return res.json()
		},
	})
}
