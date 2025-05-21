import { type QueryFunction, useQuery } from "@tanstack/react-query"

export interface WorkBookStats {
	activeCount: number
	completedCount: number
	totalEntries: number
	avgProgress: number
}

export interface WorkBooksStatsResponse {
	stats: WorkBookStats
}

export const fetchWorkBooksStats: QueryFunction<
	WorkBooksStatsResponse,
	readonly ["workBooksStats"]
> = async () => {
	const res = await fetch(`/api/work-book/stats`)
	if (!res.ok) throw new Error("Error fetching work books stats")

	return res.json()
}

export const useWorkBooksStats = () => {
	return useQuery({
		queryKey: ["workBooksStats"],
		queryFn: fetchWorkBooksStats,
		staleTime: 10 * 60 * 1000,
	})
}
