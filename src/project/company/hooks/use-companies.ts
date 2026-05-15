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
	isActive: boolean
	createdBy?: {
		id: string
		name: string
	}
	StartupFolders: {
		id: string
		status: string
	}[]
}

interface UseCompaniesParams {
	page?: number
	pageSize?: number
	order?: Order
	limit?: number
	search?: string
	orderBy?: OrderBy
	showAll?: boolean
	activeStatus?: "all" | "active" | "inactive"
}

interface CompaniesResponse {
	companies: Company[]
	total: number
	pages: number
}

export const useCompanies = ({
	page = 1,
	pageSize,
	limit,
	search = "",
	order = "desc",
	showAll = false,
	orderBy = "createdAt",
	activeStatus = showAll ? "all" : "active",
}: UseCompaniesParams = {}) => {
	const resolvedLimit = limit ?? pageSize ?? 10

	return useQuery<CompaniesResponse>({
		queryKey: [
			"companies",
			{ page, limit: resolvedLimit, search, order, orderBy, showAll, activeStatus },
		],
		queryFn: (fn) =>
			fetchCompanies({
				...fn,
				queryKey: [
					"companies",
					{ page, limit: resolvedLimit, search, order, orderBy, showAll, activeStatus },
				],
			}),
	})
}

export const fetchCompanies: QueryFunction<
	CompaniesResponse,
	[
		"companies",
		{
			page: number
			limit: number
			search: string
			order: Order
			orderBy: OrderBy
			showAll: boolean
			activeStatus: "all" | "active" | "inactive"
		},
	]
> = async ({ queryKey }) => {
	const [, { page, limit, search, order, orderBy, showAll, activeStatus }]: [
		string,
		{
			page: number
			limit: number
			search: string
			order: Order
			orderBy: OrderBy
			showAll: boolean
			activeStatus: "all" | "active" | "inactive"
		},
	] = queryKey

	const searchParams = new URLSearchParams()
	searchParams.set("page", page.toString())
	searchParams.set("limit", limit.toString())
	if (order) searchParams.set("order", order)
	if (search) searchParams.set("search", search)
	if (orderBy) searchParams.set("orderBy", orderBy)
	if (showAll) searchParams.set("showAll", showAll.toString())
	if (activeStatus !== "active") searchParams.set("activeStatus", activeStatus)

	const res = await fetch(`/api/companies?${searchParams.toString()}`)
	if (!res.ok) throw new Error("Error fetching companies")

	return res.json()
}
