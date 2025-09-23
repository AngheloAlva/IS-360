import { type QueryFunction, useQuery } from "@tanstack/react-query"

import type { Order, OrderBy } from "@/shared/components/OrderByButton"

export interface CompanyWithLaborControlFolder {
	id: string
	rut: string
	name: string
	image?: string
	laborControlFolders: {
		_count: {
			documents: number
			workerFolders: number
		}
	}
}

export interface CompanyWithLaborControlFolderRes {
	total: number
	pages: number
	companiesWithLaborControlFolders: CompanyWithLaborControlFolder[]
}

interface UseLaborControlFolderParams {
	page: number
	order: Order
	limit: number
	search?: string
	orderBy: OrderBy
	onlyWithReviewRequest?: boolean
}

export const fetchCompaniesWithLaborControlFolderList: QueryFunction<
	CompanyWithLaborControlFolderRes,
	readonly [
		"laborControlFolder",
		{
			order: Order
			search?: string
			orderBy: OrderBy
			onlyWithReviewRequest?: boolean
			page: number
			limit: number
		},
	]
> = async ({ queryKey }) => {
	const [, { order, search, orderBy, onlyWithReviewRequest, page, limit }] = queryKey

	const searchParams = new URLSearchParams()
	searchParams.set("page", page.toString())
	searchParams.set("limit", limit.toString())
	if (order) searchParams.set("order", order)
	if (search) searchParams.set("search", search)
	if (orderBy) searchParams.set("orderBy", orderBy)
	if (onlyWithReviewRequest)
		searchParams.set("onlyWithReviewRequest", onlyWithReviewRequest.toString())

	const res = await fetch(`/api/labor-control/list?${searchParams.toString()}`)
	if (!res.ok) throw new Error("Error fetching general startup folder")

	return res.json()
}

export const useCompaniesWithLaborControlFolder = ({
	page,
	order,
	limit,
	search,
	orderBy,
	onlyWithReviewRequest,
}: UseLaborControlFolderParams) => {
	const queryKey = [
		"laborControlFolder",
		{ order, search, orderBy, onlyWithReviewRequest, page, limit },
	] as const

	return useQuery({
		queryKey,
		gcTime: 10 * 60 * 1000,
		staleTime: 5 * 60 * 1000,
		queryFn: fetchCompaniesWithLaborControlFolderList,
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
	})
}
