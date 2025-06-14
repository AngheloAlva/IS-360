import { QueryFunction, useQuery } from "@tanstack/react-query"

export interface AdminWorkPermit {
	id: string
	otNumber: {
		otNumber: string
		workName: string
	}
	company: {
		name: string
	}
	exactPlace: string
	workWillBe: string
	status: string
	workCompleted: boolean
	createdAt: string
}

interface AdminWorkPermitsParams {
	page: number
	search: string
	limit: number
	statusFilter?: string | null
}

interface AdminWorkPermitsResponse {
	workPermits: AdminWorkPermit[]
	total: number
	pages: number
}

export const fetchAdminWorkPermits: QueryFunction<
	AdminWorkPermitsResponse,
	readonly [
		"adminWorkPermits",
		{
			page: number
			limit: number
			search: string
			statusFilter: string | null
		},
	]
> = async ({ queryKey }) => {
	const [, { page, limit, search, statusFilter }] = queryKey

	const searchParams = new URLSearchParams()
	searchParams.set("page", page.toString())
	searchParams.set("limit", limit.toString())
	if (search) searchParams.set("search", search)
	if (statusFilter) searchParams.set("statusFilter", statusFilter)

	const res = await fetch(`/api/work-permit?${searchParams.toString()}`)
	if (!res.ok) throw new Error("Error fetching work permits")

	return res.json()
}

export const useAdminWorkPermits = ({
	page = 1,
	limit = 10,
	search = "",
	statusFilter = null,
}: AdminWorkPermitsParams) => {
	const queryKey = ["adminWorkPermits", { page, limit, search, statusFilter }] as const

	return useQuery<AdminWorkPermitsResponse>({
		queryKey,
		queryFn: (fn) => fetchAdminWorkPermits({ ...fn, queryKey }),
	})
}
