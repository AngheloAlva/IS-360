import { useQuery } from "@tanstack/react-query"

interface UserStats {
	totalUsers: number
	activeUsers: number
	usersByArea: {
		area: string
		count: number
	}[]
	usersByRole: {
		role: string
		count: number
	}[]
	recentlyActiveUsers: {
		id: string
		name: string
		image: string | null
		lastActive: string
	}[]
}

export function useUserStats() {
	return useQuery<UserStats>({
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
