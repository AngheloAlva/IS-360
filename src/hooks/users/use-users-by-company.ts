import { useQuery } from "@tanstack/react-query"

export interface UsersByCompany {
	id: string
	rut: string
	name: string
	phone: string
	email: string
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
}: {
	page: number
	limit: number
	search: string
	companyId: string
}) => {
	return useQuery<UsersResponse>({
		queryKey: ["usersByCompany", { page, limit, search, companyId }],
		queryFn: async () => {
			const searchParams = new URLSearchParams()
			searchParams.set("page", page.toString())
			searchParams.set("limit", limit.toString())
			if (search) searchParams.set("search", search)

			const res = await fetch(`/api/users/company/${companyId}?${searchParams.toString()}`)
			if (!res.ok) throw new Error("Error fetching users")

			return res.json()
		},
	})
}
