import { type QueryFunction, useQuery } from "@tanstack/react-query"
import type { DateRange } from "react-day-picker"

import { LOCKOUT_PERMIT_STATUS, LOCKOUT_TYPE } from "@/generated/prisma/enums"

export const WORK_PERMIT_SORT_BY = {
	CREATED_AT: "createdAt",
	STATUS: "status",
	START_DATE: "startDate",
	END_DATE: "endDate",
	EXACT_PLACE: "exactPlace",
	OT_NUMBER: "otNumber",
	COMPANY_NAME: "companyName",
	APPLICANT_NAME: "applicantName",
	APPROVAL_BY_NAME: "approvalByName",
} as const

export type WorkPermitSortBy = (typeof WORK_PERMIT_SORT_BY)[keyof typeof WORK_PERMIT_SORT_BY]
export type WorkPermitSortOrder = "asc" | "desc"

export interface WorkPermitLockoutPermit {
	id: string
	lockoutType: LOCKOUT_TYPE
	lockoutTypeOther: string | null
	startDate: Date
	endDate: Date | null
	status: LOCKOUT_PERMIT_STATUS
	activitiesToExecute: string[]
	finalObservations: string | null
	approved: boolean | null
	approvalDate: Date | null
	approvalNotes: string | null
	areaResponsible: {
		id: string
		name: string
	}
	equipments: Array<{
		id: string
		name: string
		tag: string
	}>
	lockoutRegistrations: Array<{
		id: string
		order: number
		name: string
		rut: string
		contractorId: string | null
		contractorLockNumber: string | null
		contractorInstallDate: Date | null
		contractorInstallTime: string | null
		contractorRemoveDate: Date | null
		contractorRemoveTime: string | null
		otcLockNumber: string | null
		otcOperatorId: string | null
		otcOperator: {
			id: string
			name: string
		} | null
		otcInstallDate: Date | null
		otcInstallTime: string | null
		otcRemoveDate: Date | null
		otcRemoveTime: string | null
	}>
	zeroEnergyReviews: Array<{
		id: string
		action: string
		location: string | null
		reviewedZero: boolean
		equipment: {
			id: string
			name: string
			tag: string
		}
		performedBy: {
			id: string
			name: string
		}
	}>
}

export interface WorkPermitActivity {
	id: string
	activity: string
	peligros: string[]
	riesgos: string[]
	medidasDeControl: string[]
	otroPeligro: string | null
	otroRiesgo: string | null
	otraMedidaDeControl: string | null
	order: number
	workPermitId: string
}

export interface WorkPermit {
	id: string
	otNumber?: {
		otNumber: string
		workBookName: string
		workRequest: string
		workDescription: string
	}
	isUrgent: boolean
	requiresLockout: boolean
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
	otherWasteDisposalLocation: string | null
	observations: string
	startDate: Date
	endDate: Date
	activityDetails: string[]
	activities?: WorkPermitActivity[]
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
	lockoutPermits: Array<{
		id: string
		status: LOCKOUT_PERMIT_STATUS
		lockoutRegistrations: Array<{
			id: string
			contractorLockNumber: string | null
		}>
	}>
}

interface WorkPermitsParams {
	page?: number
	limit?: number
	search?: string
	dateRange?: DateRange | null
	companyId?: string | null
	approvedBy?: string | null
	typeFilter?: string | null
	statusFilter?: string | null
	hasLockoutPermit?: boolean | null
	sortBy?: WorkPermitSortBy
	sortOrder?: WorkPermitSortOrder
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
			dateRange: DateRange | null
			companyId: string | null
			approvedBy: string | null
			typeFilter: string | null
			statusFilter: string | null
			hasLockoutPermit: boolean | null
			sortBy: WorkPermitSortBy
			sortOrder: WorkPermitSortOrder
		},
	]
> = async ({ queryKey }) => {
	const [
		,
		{
			page,
			limit,
			search,
			statusFilter,
			companyId,
			approvedBy,
			dateRange,
			typeFilter,
			hasLockoutPermit,
			sortBy,
			sortOrder,
		},
	] = queryKey

	const searchParams = new URLSearchParams()
	searchParams.set("page", page.toString())
	searchParams.set("limit", limit.toString())
	if (search) searchParams.set("search", search)
	if (companyId) searchParams.set("companyId", companyId)
	if (approvedBy) searchParams.set("approvedBy", approvedBy)
	if (typeFilter) searchParams.set("typeFilter", typeFilter)
	if (statusFilter) searchParams.set("statusFilter", statusFilter)
	if (dateRange?.from) searchParams.set("dateFrom", `${dateRange.from}`)
	if (dateRange?.to) searchParams.set("dateTo", `${dateRange.to}`)
	if (sortBy) searchParams.set("sortBy", sortBy)
	if (sortOrder) searchParams.set("sortOrder", sortOrder)
	if (hasLockoutPermit) searchParams.set("hasLockoutPermit", hasLockoutPermit ? "true" : "false")

	const res = await fetch(`/api/work-permit?${searchParams.toString()}`)
	if (!res.ok) throw new Error("Error fetching work permits")

	return res.json()
}

export const useWorkPermits = ({
	page = 1,
	limit = 10,
	search = "",
	dateRange = null,
	sortOrder = "desc",
	companyId = null,
	approvedBy = null,
	typeFilter = null,
	statusFilter = null,
	sortBy = "createdAt",
	hasLockoutPermit = null,
}: WorkPermitsParams) => {
	const queryKey = [
		"workPermits",
		{
			page,
			limit,
			search,
			sortBy,
			sortOrder,
			companyId,
			dateRange,
			approvedBy,
			typeFilter,
			statusFilter,
			hasLockoutPermit,
		},
	] as const

	return useQuery<WorkPermitsResponse>({
		queryKey,
		queryFn: (fn) => fetchWorkPermits({ ...fn, queryKey }),
	})
}
