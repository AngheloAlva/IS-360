import { useQuery } from "@tanstack/react-query"

interface UserStats {
	totalUsers: number
	activeUsers: number
	usersByRole: {
		role: string
		count: number
		color: string
	}[]
	usersByArea: {
		area: string
		count: number
	}[]
	usersByInternalRole: {
		role: string
		count: number
	}[]
	twoFactorEnabled: number
	recentlyActiveUsers: {
		id: string
		name: string
		role: string
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
	})
}
