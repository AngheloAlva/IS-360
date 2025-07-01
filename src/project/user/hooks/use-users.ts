import { useQuery, type QueryFunction } from "@tanstack/react-query"

import type { Order, OrderBy } from "@/shared/components/OrderByButton"
import type { ApiUser } from "@/project/user/types/api-user"

interface UseUsersParams {
	order?: Order
	page?: number
	limit?: number
	search?: string
	orderBy?: OrderBy
	showOnlyInternal?: boolean
}

interface UsersResponse {
	pages: number
	total: number
	users: ApiUser[]
}

export const useUsers = ({
	order,
	orderBy,
	page = 1,
	limit = 10,
	search = "",
	showOnlyInternal = true,
}: UseUsersParams = {}) => {
	return useQuery<UsersResponse>({
		queryKey: ["users", { page, limit, search, showOnlyInternal, order, orderBy }],
		queryFn: (fn) =>
			fetchUsers({
				...fn,
				queryKey: ["users", { page, limit, search, showOnlyInternal, order, orderBy }],
			}),
		staleTime: 5 * 60 * 1000,
	})
}

export const fetchUsers: QueryFunction<UsersResponse, ["users", UseUsersParams]> = async ({
	queryKey,
}) => {
	const [, { page, limit, search, showOnlyInternal, order, orderBy }]: [
		string,
		{
			order?: Order
			page?: number
			limit?: number
			search?: string
			orderBy?: OrderBy
			showOnlyInternal?: boolean
		},
	] = queryKey

	const searchParams = new URLSearchParams()
	searchParams.set("page", page?.toString() || "1")
	searchParams.set("limit", limit?.toString() || "10")
	if (search) searchParams.set("search", search)
	if (showOnlyInternal) searchParams.set("showOnlyInternal", "true")
	searchParams.set("order", order || "asc")
	searchParams.set("orderBy", orderBy || "createdAt")

	const res = await fetch(`/api/users?${searchParams.toString()}`)
	if (!res.ok) throw new Error("Error fetching users")

	return res.json()
}
