import { useQuery } from "@tanstack/react-query"

import type { ACCESS_ROLE } from "@prisma/client"

export interface UsersByCompany {
	id: string
	rut: string
	name: string
	phone: string
	email: string
	isActive: boolean
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
	limit = 10,
	search = "",
	showAll = false,
}: {
	page: number
	limit: number
	search: string
	showAll?: boolean
	companyId: string
}) => {
	return useQuery<UsersResponse>({
		queryKey: ["usersByCompany", { page, limit, search, companyId, showAll }],
		queryFn: async () => {
			const searchParams = new URLSearchParams()
			searchParams.set("page", page.toString())
			searchParams.set("limit", limit.toString())
			searchParams.set("showAll", showAll.toString())
			if (search) searchParams.set("search", search)

			const res = await fetch(`/api/users/company/${companyId}?${searchParams.toString()}`)
			if (!res.ok) throw new Error("Error fetching users")

			return res.json()
		},
	})
}
