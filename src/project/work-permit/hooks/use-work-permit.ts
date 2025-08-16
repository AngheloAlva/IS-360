import { type QueryFunction, useQuery } from "@tanstack/react-query"

import type { Order, OrderBy } from "@/shared/components/OrderByButton"

export interface WorkPermit {
	id: string
	otNumber?: {
		otNumber: string
		workBookName: string
		workRequest: string
		workDescription: string
	}
	isUrgent: boolean
	status: string
	mutuality: string
	otherMutuality: string
	exactPlace: string
	workWillBe: string
	workWillBeOther: string
	tools: string[]
	otherTools: string | null
	preChecks: string[]
	otherPreChecks: string
	riskIdentification: string[]
	otherRisk: string
	preventiveControlMeasures: string[]
	otherPreventiveControlMeasures: string
	generateWaste: boolean
	wasteType: string
	wasteDisposalLocation: string
	observations: string
	startDate: Date
	endDate: Date
	activityDetails: string[]
	operatorWorker?: string
	workCompleted: boolean
	user: {
		id: string
		name: string
		rut: string
	}
	company: {
		id: string
		name: string
		rut: string
	}
	_count: {
		participants: number
		attachments: number
	}
	participants: Array<{
		id: string
		name: string
	}>
	attachments: Array<{
		id: string
		name: string
		url: string
		type: string
		size: number | null
		uploadedAt: Date
		uploadedBy: {
			id: string
			name: string
		}
	}>
	approvalNotes?: string
	approvalDate: Date | null
	approvalBy: {
		id: string
		rut: string
		name: string
	} | null
	closingDate: Date | null
	closingBy: {
		id: string
		rut: string
		name: string
	} | null
}

interface WorkPermitsParams {
	page: number
	order: Order
	limit: number
	search: string
	orderBy: OrderBy
	date: Date | null
	companyId: string | null
	approvedBy: string | null
	typeFilter: string | null
	statusFilter: string | null
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
			order: Order
			limit: number
			search: string
			orderBy: OrderBy
			date: Date | null
			companyId: string | null
			approvedBy: string | null
			typeFilter: string | null
			statusFilter: string | null
		},
	]
> = async ({ queryKey }) => {
	const [
		,
		{ page, limit, search, statusFilter, companyId, approvedBy, date, orderBy, order, typeFilter },
	] = queryKey

	const searchParams = new URLSearchParams()
	searchParams.set("page", page.toString())
	searchParams.set("limit", limit.toString())
	if (search) searchParams.set("search", search)
	if (companyId) searchParams.set("companyId", companyId)
	if (approvedBy) searchParams.set("approvedBy", approvedBy)
	if (typeFilter) searchParams.set("typeFilter", typeFilter)
	if (statusFilter) searchParams.set("statusFilter", statusFilter)
	if (date) searchParams.set("date", date.toISOString())
	if (orderBy) searchParams.set("orderBy", orderBy)
	if (order) searchParams.set("order", order)

	const res = await fetch(`/api/work-permit?${searchParams.toString()}`)
	if (!res.ok) throw new Error("Error fetching work permits")

	return res.json()
}

export const useWorkPermits = ({
	page = 1,
	limit = 10,
	search = "",
	date = null,
	order = "desc",
	companyId = null,
	approvedBy = null,
	typeFilter = null,
	statusFilter = null,
	orderBy = "createdAt",
}: WorkPermitsParams) => {
	const queryKey = [
		"workPermits",
		{
			page,
			limit,
			order,
			search,
			orderBy,
			companyId,
			date,
			approvedBy,
			typeFilter,
			statusFilter,
		},
	] as const

	return useQuery<WorkPermitsResponse>({
		queryKey,
		queryFn: (fn) => fetchWorkPermits({ ...fn, queryKey }),
	})
}
