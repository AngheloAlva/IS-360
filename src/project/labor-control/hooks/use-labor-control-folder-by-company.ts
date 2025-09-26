import { Order, OrderBy } from "@/shared/components/OrderByButton"

import { type QueryFunction, useQuery } from "@tanstack/react-query"
import type { LABOR_CONTROL_STATUS } from "@prisma/client"

export interface LaborControlFolderByCompany {
	id: string
	createdAt: string
	status: LABOR_CONTROL_STATUS
}

interface LaborControlFolderByCompanyRes {
	total: number
	pages: number
	data: LaborControlFolderByCompany[]
}

interface UseLaborControlFolderParams {
	page: number
	order: Order
	limit: number
	orderBy: OrderBy
	companyId: string
}

export const fetchLaborControlFolderByCompany: QueryFunction<
	LaborControlFolderByCompanyRes,
	readonly [
		"laborControlFolderByCompany",
		{ companyId: string; page: number; order: Order; limit: number; orderBy: OrderBy },
	]
> = async ({ queryKey }) => {
	const [, { companyId, page, order, limit, orderBy }] = queryKey

	const searchParams = new URLSearchParams()
	searchParams.set("page", page.toString())
	searchParams.set("order", order)
	searchParams.set("limit", limit.toString())
	searchParams.set("orderBy", orderBy)

	const res = await fetch(`/api/labor-control/by-company/${companyId}?${searchParams.toString()}`)
	if (!res.ok) throw new Error("Error fetching general labor control folder")

	return res.json()
}

export const useLaborControlFolderByCompany = ({
	page,
	order,
	limit,
	orderBy,
	companyId,
}: UseLaborControlFolderParams) => {
	const queryKey = [
		"laborControlFolderByCompany",
		{ companyId, page, order, limit, orderBy },
	] as const

	return useQuery({
		queryKey,
		enabled: !!companyId,
		queryFn: fetchLaborControlFolderByCompany,
		staleTime: 5 * 60 * 1000,
		gcTime: 15 * 60 * 1000,
		retry: 2,
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
	})
}
