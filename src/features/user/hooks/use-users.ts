import { useQuery, type QueryFunction } from "@tanstack/react-query"

import type { ApiUser } from "@/features/user/types/api-user"

interface UseUsersParams {
	page?: number
	limit?: number
	search?: string
	showOnlyInternal?: boolean
}

interface UsersResponse {
	pages: number
	total: number
	users: ApiUser[]
}

export const useUsers = ({
	page = 1,
	limit = 10,
	search = "",
	showOnlyInternal = true,
}: UseUsersParams = {}) => {
	return useQuery<UsersResponse>({
		queryKey: ["users", { page, limit, search, showOnlyInternal }],
		queryFn: (fn) =>
			fetchUsers({
				...fn,
				queryKey: ["users", { page, limit, search, showOnlyInternal }],
			}),
	})
}

export const fetchUsers: QueryFunction<UsersResponse, ["users", UseUsersParams]> = async ({
	queryKey,
}) => {
	const [, { page, limit, search, showOnlyInternal }]: [
		string,
		{ page?: number; limit?: number; search?: string; showOnlyInternal?: boolean },
	] = queryKey

	const searchParams = new URLSearchParams()
	searchParams.set("page", page?.toString() || "1")
	searchParams.set("limit", limit?.toString() || "10")
	if (search) searchParams.set("search", search)
	if (showOnlyInternal) searchParams.set("showOnlyInternal", "true")

	const res = await fetch(`/api/users?${searchParams.toString()}`)
	if (!res.ok) throw new Error("Error fetching users")

	return res.json()
}
