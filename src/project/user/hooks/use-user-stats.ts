import { useQuery } from "@tanstack/react-query"

interface UserStatsResponse {
	basicStats: {
		totalUsers: number
		twoFactorEnabled: number
		totalContractors: number
		totalSupervisors: number
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
