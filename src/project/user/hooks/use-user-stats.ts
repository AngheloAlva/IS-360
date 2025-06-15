import { useQuery } from "@tanstack/react-query"
import { WORK_ORDER_STATUS } from "@prisma/client"

type WorkOrderStatus = keyof typeof WORK_ORDER_STATUS

interface UserStatsResponse {
	basicStats: {
		totalUsers: number
		twoFactorEnabled: number
		totalContractors: number
		totalSupervisors: number
	}
	charts: {
		topUsersByWorkOrders: Array<{
			name: string
			workOrders: Record<WorkOrderStatus, number>
		}>
		documentActivity: Array<{
			name: string
			activity: Array<{
				date: string
				documents: number
			}>
		}>
	}
}

export function useUserStats() {
	return useQuery<UserStatsResponse>({
		queryKey: ["userStats"],
		queryFn: async () => {
			const response = await fetch("/api/users/stats")
			if (!response.ok) {
				throw new Error("Error al obtener estadísticas de usuarios")
			}
			return response.json()
		},
		staleTime: 5 * 60 * 1000,
	})
}
