import { useQuery, type QueryFunction } from "@tanstack/react-query"

import type { Order, OrderBy } from "@/shared/components/OrderByButton"
import type { ApiUser } from "@/project/user/types/api-user"

interface UseUsersParams {
	order?: Order
	page?: number
	pageSize?: number
	limit?: number
	search?: string
	orderBy?: OrderBy
	area?: string
}

interface UsersResponse {
	pages: number
	total: number
	users: ApiUser[]
}

export const useUsers = ({
	order,
	orderBy,
	pageSize,
	page = 1,
	limit,
	search = "",
	area = "all",
}: UseUsersParams = {}) => {
	const resolvedLimit = limit ?? pageSize ?? 10

	return useQuery<UsersResponse>({
		queryKey: ["users", { page, limit: resolvedLimit, search, order, orderBy, area }],
		queryFn: (fn) =>
			fetchUsers({
				...fn,
				queryKey: ["users", { page, limit: resolvedLimit, search, order, orderBy, area }],
			}),
		staleTime: 5 * 60 * 1000,
	})
}

export const fetchUsers: QueryFunction<UsersResponse, ["users", UseUsersParams]> = async ({
	queryKey,
}) => {
	const [, { page, limit, search, order, orderBy, area }]: [
		string,
		{
			order?: Order
			page?: number
			limit?: number
			search?: string
			orderBy?: OrderBy
			area?: string
		},
	] = queryKey

	const searchParams = new URLSearchParams()
	searchParams.set("page", page?.toString() || "1")
	searchParams.set("limit", limit?.toString() || "10")
	if (search) searchParams.set("search", search)
	if (area && area !== "all") searchParams.set("area", area)
	searchParams.set("order", order || "asc")
	searchParams.set("orderBy", orderBy || "createdAt")

	const res = await fetch(`/api/users?${searchParams.toString()}`)
	if (!res.ok) throw new Error("Error fetching users")

	return res.json()
}
