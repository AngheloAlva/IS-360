import { useQuery } from "@tanstack/react-query"

import type { ACCESS_ROLE } from "@/generated/prisma/enums"

type ActiveStatus = "all" | "active" | "inactive"
type SortOrder = "asc" | "desc"
type UsersByCompanySortBy =
	| "name"
	| "email"
	| "rut"
	| "internalRole"
	| "internalArea"
	| "isSupervisor"
	| "isActive"
	| "createdAt"

export interface UsersByCompany {
	id: string
	rut: string
	name: string
	phone: string
	email: string
	isActive: boolean
	isAccredited: boolean
	accreditationOverride: boolean | null
	role: ACCESS_ROLE
	companyId: string
	internalRole: string
	internalArea: string
	image: string | null
	isSupervisor: boolean
}

interface UsersResponse {
	users: UsersByCompany[]
	total: number
	pages: number
}

export const useUsersByCompany = ({
	page = 1,
	companyId,
	pageSize,
	limit,
	search = "",
	showAll = false,
	activeStatus = showAll ? "all" : "active",
	sortBy = "createdAt",
	sortOrder = "desc",
}: {
	page: number
	pageSize?: number
	limit?: number
	search: string
	showAll?: boolean
	activeStatus?: ActiveStatus
	sortBy?: UsersByCompanySortBy
	sortOrder?: SortOrder
	companyId: string
}) => {
	const resolvedLimit = limit ?? pageSize ?? 10

	return useQuery<UsersResponse>({
		queryKey: [
			"usersByCompany",
			{ page, limit: resolvedLimit, search, companyId, showAll, activeStatus, sortBy, sortOrder },
		],
		queryFn: async () => {
			const searchParams = new URLSearchParams()
			searchParams.set("page", page.toString())
			searchParams.set("limit", resolvedLimit.toString())
			searchParams.set("showAll", showAll.toString())
			searchParams.set("activeStatus", activeStatus)
			searchParams.set("sortBy", sortBy)
			searchParams.set("sortOrder", sortOrder)
			if (search) searchParams.set("search", search)

			const res = await fetch(`/api/users/company/${companyId}?${searchParams.toString()}`)
			if (!res.ok) throw new Error("Error fetching users")

			return res.json()
		},
	})
}
