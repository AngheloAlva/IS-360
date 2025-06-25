import { type QueryFunction, useQuery } from "@tanstack/react-query"

import type { Order, OrderBy } from "@/shared/components/OrderByButton"

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
	image: string | null
	createdBy?: {
		id: string
		name: string
	}
}

interface UseCompaniesParams {
	page?: number
	order?: Order
	limit?: number
	search?: string
	orderBy?: OrderBy
}

interface CompaniesResponse {
	companies: Company[]
	total: number
	pages: number
}

export const useCompanies = ({
	page = 1,
	limit = 10,
	search = "",
	order = "desc",
	orderBy = "createdAt",
}: UseCompaniesParams = {}) => {
	return useQuery<CompaniesResponse>({
		queryKey: ["companies", { page, limit, search, order, orderBy }],
		queryFn: (fn) =>
			fetchCompanies({ ...fn, queryKey: ["companies", { page, limit, search, order, orderBy }] }),
	})
}

export const fetchCompanies: QueryFunction<
	CompaniesResponse,
	["companies", { page: number; limit: number; search: string; order: Order; orderBy: OrderBy }]
> = async ({ queryKey }) => {
	const [, { page, limit, search, order, orderBy }]: [
		string,
		{ page: number; limit: number; search: string; order: Order; orderBy: OrderBy },
	] = queryKey

	const searchParams = new URLSearchParams()
	searchParams.set("page", page.toString())
	searchParams.set("limit", limit.toString())
	if (order) searchParams.set("order", order)
	if (search) searchParams.set("search", search)
	if (orderBy) searchParams.set("orderBy", orderBy)

	const res = await fetch(`/api/companies?${searchParams.toString()}`)
	if (!res.ok) throw new Error("Error fetching companies")

	return res.json()
}
