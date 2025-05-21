import { QueryFunction, useQuery } from "@tanstack/react-query"

interface SafetyTalkStatus {
	id: string
	title: string
	minimumScore: number
	expiresAt: Date
	isPresential: boolean
	completed: boolean
	score?: number
	passed?: boolean
	completedAt?: Date
}

export interface CompanyUser {
	id: string
	name: string
	isSupervisor: boolean
	safetyTalks: SafetyTalkStatus[]
}

export interface Company {
	id: string
	rut: string
	name: string
	createdAt: Date
	users: CompanyUser[]
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
		queryFn: (fn) => fetchCompanies({ ...fn, queryKey: ["companies", { page, limit, search }] }),
	})
}

export const fetchCompanies: QueryFunction<
	CompaniesResponse,
	["companies", { page: number; limit: number; search: string }]
> = async ({ queryKey }) => {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [_, { page, limit, search }]: [string, { page: number; limit: number; search: string }] =
		queryKey

	const searchParams = new URLSearchParams()
	searchParams.set("page", page.toString())
	searchParams.set("limit", limit.toString())
	if (search) searchParams.set("search", search)

	const res = await fetch(`/api/companies?${searchParams.toString()}`)
	if (!res.ok) throw new Error("Error fetching companies")

	return res.json()
}
