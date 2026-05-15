import { useQuery, type QueryFunction } from "@tanstack/react-query"
import { DateRange } from "react-day-picker"

import type { ApiActivityLog } from "@/project/activity-log/types/api-activity-log"
import type { Order, OrderBy } from "@/shared/components/OrderByButton"

interface UseActivityLogsParams {
	order?: Order
	page?: number
	pageSize?: number
	limit?: number
	search?: string
	orderBy?: OrderBy
	module?: string
	action?: string
	userId?: string
	actorType?: string
	severity?: string
	dateRange?: DateRange | null
}

interface ActivityLogsResponse {
	pages: number
	total: number
	logs: ApiActivityLog[]
}

export const useActivityLogs = ({
	order,
	orderBy,
	pageSize,
	page = 1,
	limit,
	search = "",
	module = "all",
	action = "all",
	userId = "all",
	actorType = "all",
	severity = "all",
	dateRange = null,
}: UseActivityLogsParams = {}) => {
	const resolvedLimit = limit ?? pageSize ?? 25

	return useQuery<ActivityLogsResponse>({
		queryKey: [
			"activity-logs",
			{
				page,
				limit: resolvedLimit,
				search,
				order,
				orderBy,
				module,
				action,
				userId,
				actorType,
				severity,
				dateFrom: dateRange?.from?.toISOString() ?? null,
				dateTo: dateRange?.to?.toISOString() ?? null,
			},
		],
		queryFn: (fn) =>
			fetchActivityLogs({
				...fn,
				queryKey: [
					"activity-logs",
					{
						page,
						limit: resolvedLimit,
						search,
						order,
						orderBy,
						module,
						action,
						userId,
						actorType,
						severity,
						dateFrom: dateRange?.from?.toISOString() ?? null,
						dateTo: dateRange?.to?.toISOString() ?? null,
					},
				],
			}),
		staleTime: 5 * 60 * 1000,
	})
}

interface FetchParams {
	page?: number
	limit?: number
	search?: string
	order?: Order
	orderBy?: OrderBy
	module?: string
	action?: string
	userId?: string
	actorType?: string
	severity?: string
	dateFrom?: string | null
	dateTo?: string | null
}

export const fetchActivityLogs: QueryFunction<
	ActivityLogsResponse,
	["activity-logs", FetchParams]
> = async ({ queryKey }) => {
	const [, params] = queryKey

	const searchParams = new URLSearchParams()
	searchParams.set("page", params.page?.toString() || "1")
	searchParams.set("limit", params.limit?.toString() || "25")
	if (params.search) searchParams.set("search", params.search)
	if (params.module && params.module !== "all") searchParams.set("module", params.module)
	if (params.action && params.action !== "all") searchParams.set("action", params.action)
	if (params.userId && params.userId !== "all") searchParams.set("userId", params.userId)
	if (params.actorType && params.actorType !== "all") searchParams.set("actorType", params.actorType)
	if (params.severity && params.severity !== "all") searchParams.set("severity", params.severity)
	if (params.dateFrom) searchParams.set("dateFrom", params.dateFrom)
	if (params.dateTo) searchParams.set("dateTo", params.dateTo)
	searchParams.set("order", params.order || "desc")
	const apiOrderBy = params.orderBy === "createdAt" ? "timestamp" : (params.orderBy || "timestamp")
	searchParams.set("orderBy", apiOrderBy)

	const res = await fetch(`/api/activity-logs?${searchParams.toString()}`)
	if (!res.ok) throw new Error("Error fetching activity logs")

	return res.json()
}
