import { useQuery } from "@tanstack/react-query"

export interface WorkRequestStatsResponse {
	totalWorkRequests: number
	totalPending: number
	totalAttended: number
	totalCancelled: number
	urgencyStats: {
		urgent: {
			attended: number
			pending: number
		}
		nonUrgent: {
			attended: number
			pending: number
		}
	}
	monthlyTrend: {
		month: string
		created: number
		attended: number
	}[]
}

async function getWorkRequestStats(): Promise<WorkRequestStatsResponse> {
	const response = await fetch(`/api/work-request/stats`)

	if (!response.ok) {
		throw new Error("Error al obtener las estadísticas de la empresa")
	}

	return response.json()
}

export function useWorkRequestStats() {
	return useQuery({
		queryKey: ["work-request", "stats"],
		queryFn: () => getWorkRequestStats(),
	})
}
