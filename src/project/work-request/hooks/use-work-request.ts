import { useQuery, type QueryFunction } from "@tanstack/react-query"

import type {
	Attachment,
	WorkRequest as WorkRequestModel,
	WorkRequestComment,
} from "@prisma/client"

interface UseWorkRequestParams {
	page?: number
	limit?: number
	search?: string
	status?: string
	isUrgent: boolean | null
}

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
	attachments: Attachment[]
	comments: Array<
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
		location: string
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
	limit = 10,
	search = "",
	status = "all",
}: UseWorkRequestParams) => {
	return useQuery<WorkRequestResponse>({
		queryKey: ["workRequests", { page, limit, search, status, isUrgent }],
		queryFn: (fn) =>
			fetchWorkRequests({
				...fn,
				queryKey: ["workRequests", { page, limit, search, status, isUrgent }],
			}),
	})
}

export const fetchWorkRequests: QueryFunction<
	WorkRequestResponse,
	["workRequests", UseWorkRequestParams]
> = async ({ queryKey }) => {
	const [, { page, limit, search, status, isUrgent }]: [
		string,
		{ page?: number; limit?: number; search?: string; status?: string; isUrgent: boolean | null },
	] = queryKey

	const searchParams = new URLSearchParams()
	searchParams.set("page", page?.toString() || "1")
	searchParams.set("limit", limit?.toString() || "10")
	if (search) searchParams.set("search", search)
	if (status) searchParams.set("status", status)
	searchParams.set("isUrgent", isUrgent?.toString() || "all")

	const res = await fetch(`/api/work-request?${searchParams.toString()}`)
	if (!res.ok) throw new Error("Error fetching work requests")

	return res.json()
}
