import { useQuery } from "@tanstack/react-query"

import type { ApiUser } from "@/types/user"

interface UseUsersParams {
	page?: number
	limit?: number
	search?: string
	role?: string
}

interface UsersResponse {
	users: ApiUser[]
	total: number
	pages: number
}

export const useUsers = ({ page = 1, limit = 10, search = "", role }: UseUsersParams = {}) => {
	return useQuery<UsersResponse>({
		queryKey: ["users", { page, limit, search, role }],
		queryFn: async () => {
			const searchParams = new URLSearchParams()
			searchParams.set("page", page.toString())
			searchParams.set("limit", limit.toString())
			if (search) searchParams.set("search", search)
			if (role) searchParams.set("role", role)

			const res = await fetch(`/api/users?${searchParams.toString()}`)
			if (!res.ok) throw new Error("Error fetching users")

			return res.json()
		},
	})
}
