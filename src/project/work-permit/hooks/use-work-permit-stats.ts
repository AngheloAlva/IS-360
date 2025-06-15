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

export function useWorkPermitStats() {
	return useQuery<WorkPermitStats>({
		queryKey: ["work-permit-stats"],
		queryFn: async () => {
			const response = await fetch("/api/work-permit/stats")
			if (!response.ok) {
				throw new Error("Failed to fetch work permit stats")
			}
			return response.json()
		},
	})
}
