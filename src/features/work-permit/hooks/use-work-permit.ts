import { QueryFunction, useQuery } from "@tanstack/react-query"
import { DateRange } from "react-day-picker"

export interface WorkPermit {
	id: string
	otNumber: {
		otNumber: string
		workName: string
	}
	status: string
	mutuality: string
	otherMutuality: string
	exactPlace: string
	workWillBe: string
	workWillBeOther: string
	tools: string
	otherTools: string
	preChecks: string
	otherPreChecks: string
	riskIdentification: string
	otherRisk: string
	preventiveControlMeasures: string
	otherPreventiveControlMeasures: string
	generateWaste: string
	wasteType: string
	wasteDisposalLocation: string
	observations: string
	startDate: string
	endDate: string
	user: {
		name: string
		rut: string
	}
	company: {
		name: string
		rut: string
	}
	_count: {
		participants: number
	}
}

interface WorkPermitsParams {
	page: number
	limit: number
	search: string
	statusFilter: string | null
	companyId: string | null
	dateRange: DateRange | null
}

interface WorkPermitsResponse {
	workPermits: WorkPermit[]
	total: number
	pages: number
}

export const fetchWorkPermits: QueryFunction<
	WorkPermitsResponse,
	readonly [
		"workPermits",
		{
			page: number
			limit: number
			search: string
			statusFilter: string | null
			companyId: string | null
			dateRange: DateRange | null
		},
	]
> = async ({ queryKey }) => {
	const [, { page, limit, search, statusFilter, companyId, dateRange }] = queryKey

	const searchParams = new URLSearchParams()
	searchParams.set("page", page.toString())
	searchParams.set("limit", limit.toString())
	if (search) searchParams.set("search", search)
	if (statusFilter) searchParams.set("statusFilter", statusFilter)
	if (companyId) searchParams.set("companyId", companyId)
	if (dateRange?.from) searchParams.set("startDate", dateRange.from.toISOString())
	if (dateRange?.to) searchParams.set("endDate", dateRange.to.toISOString())

	const res = await fetch(`/api/work-permit?${searchParams.toString()}`)
	if (!res.ok) throw new Error("Error fetching work permits")

	return res.json()
}

export const useWorkPermits = ({
	page = 1,
	limit = 10,
	search = "",
	statusFilter = null,
	companyId = null,
	dateRange = null,
}: WorkPermitsParams) => {
	const queryKey = [
		"workPermits",
		{ page, limit, search, statusFilter, companyId, dateRange },
	] as const

	return useQuery<WorkPermitsResponse>({
		queryKey,
		queryFn: (fn) => fetchWorkPermits({ ...fn, queryKey }),
	})
}
