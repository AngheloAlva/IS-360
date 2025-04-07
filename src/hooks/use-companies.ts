import { useQuery } from "@tanstack/react-query"

export interface Company {
	id: string
	rut: string
	name: string
	createdAt: Date
	users: Array<{
		name: string
	}>
}

interface UseCompaniesParams {
	page?: number
	limit?: number
	search?: string
}

interface CompaniesResponse {
	companies: Company[]
	total: number
	pages: number
}

export const useCompanies = ({ page = 1, limit = 10, search = "" }: UseCompaniesParams = {}) => {
	return useQuery<CompaniesResponse>({
		queryKey: ["companies", { page, limit, search }],
		queryFn: async () => {
			const searchParams = new URLSearchParams()
			searchParams.set("page", page.toString())
			searchParams.set("limit", limit.toString())
			if (search) searchParams.set("search", search)

			const res = await fetch(`/api/companies?${searchParams.toString()}`)
			if (!res.ok) throw new Error("Error fetching companies")

			return res.json()
		},
	})
}
