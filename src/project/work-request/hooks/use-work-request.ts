import { useQuery, type QueryFunction } from "@tanstack/react-query"

import type {
	Attachment,
	WorkRequest as WorkRequestModel,
	WorkRequestComment,
} from "@/generated/prisma/client"
import type { WorkOrderStatusLabels } from "@/lib/consts/work-order-status"
import type { WorkOrderTypeLabels } from "@/lib/consts/work-order-types"

interface UseWorkRequestParams {
	page?: number
	pageSize?: number
	limit?: number
	search?: string
	status?: string
	isUrgent: boolean | null
	sortBy?: WorkRequestSortBy
	sortOrder?: "asc" | "desc"
	include?: "table" | "full"
}

export const WORK_REQUEST_SORT_BY = {
	REQUEST_NUMBER: "requestNumber",
	REQUEST_DATE: "requestDate",
	STATUS: "status",
	IS_URGENT: "isUrgent",
	WORK_TYPE: "workType",
	CREATED_AT: "createdAt",
} as const

export type WorkRequestSortBy = (typeof WORK_REQUEST_SORT_BY)[keyof typeof WORK_REQUEST_SORT_BY]

export interface WorkRequest extends WorkRequestModel {
	user: {
		name: string
		email: string
		image: string | null
		company: {
			name: string | null
		} | null
	}
	operator: {
		name: string
		email: string
		image: string | null
	} | null
	attachments?: Attachment[]
	comments?: Array<
		WorkRequestComment & {
			user: {
				name: string
				email: string
				image: string | null
			}
		}
	>
	equipments: Array<{
		id: string
		name: string
		tag: string
		location: { id: string; name: string; path: string }
	}>
	workOrders?: Array<{
		id: string
		otNumber: string
		status: keyof typeof WorkOrderStatusLabels
		type: keyof typeof WorkOrderTypeLabels
		programDate: string
		estimatedHours: number
	}>
}

interface WorkRequestResponse {
	pages: number
	total: number
	workRequests: WorkRequest[]
}

export const useWorkRequests = ({
	page = 1,
	isUrgent,
	pageSize,
	limit,
	search = "",
	status = "all",
	sortBy = WORK_REQUEST_SORT_BY.CREATED_AT,
	sortOrder = "desc",
	include = "table",
}: UseWorkRequestParams) => {
	const resolvedLimit = limit ?? pageSize ?? 10

	return useQuery<WorkRequestResponse>({
		queryKey: [
			"workRequests",
			{ page, limit: resolvedLimit, search, status, isUrgent, sortBy, sortOrder, include },
		],
		queryFn: (fn) =>
			fetchWorkRequests({
				...fn,
				queryKey: [
					"workRequests",
					{ page, limit: resolvedLimit, search, status, isUrgent, sortBy, sortOrder, include },
				],
			}),
	})
}

export const fetchWorkRequests: QueryFunction<
	WorkRequestResponse,
	["workRequests", UseWorkRequestParams]
> = async ({ queryKey }) => {
	const [, { page, limit, search, status, isUrgent, sortBy, sortOrder, include }]: [
		string,
		{
			page?: number
			limit?: number
			search?: string
			status?: string
			isUrgent: boolean | null
			sortBy?: WorkRequestSortBy
			sortOrder?: "asc" | "desc"
			include?: "table" | "full"
		},
	] = queryKey

	const resolvedSortBy = sortBy ?? WORK_REQUEST_SORT_BY.CREATED_AT
	const resolvedSortOrder = sortOrder ?? "desc"
	const resolvedInclude = include ?? "table"

	const searchParams = new URLSearchParams()
	searchParams.set("page", page?.toString() || "1")
	searchParams.set("limit", limit?.toString() || "10")
	if (search) searchParams.set("search", search)
	if (status) searchParams.set("status", status)
	searchParams.set("isUrgent", isUrgent?.toString() || "all")
	searchParams.set("sortBy", resolvedSortBy)
	searchParams.set("sortOrder", resolvedSortOrder)
	searchParams.set("include", resolvedInclude)

	const res = await fetch(`/api/work-request?${searchParams.toString()}`)
	if (!res.ok) throw new Error("Error fetching work requests")

	return res.json()
}

export const useWorkRequestById = ({ id, enabled }: { id: string; enabled: boolean }) => {
	return useQuery<WorkRequest>({
		queryKey: ["workRequest", id],
		queryFn: async () => {
			const response = await fetch(`/api/work-request/${id}`)
			if (!response.ok) throw new Error("Error fetching work request details")
			return response.json()
		},
		enabled: enabled && Boolean(id),
	})
}
