"use client"

import { useQuery } from "@tanstack/react-query"

interface WorkBookProgressData {
	week: string
	avgProgress: number
}

export const useWorkBookProgressChart = () => {
	return useQuery<WorkBookProgressData[]>({
		queryKey: ["workBookProgressChart"],
		queryFn: async () => {
			const res = await fetch("/api/work-book/stats/progress")
			if (!res.ok) throw new Error("Error fetching work book progress chart data")
			return res.json()
		},
	})
}
