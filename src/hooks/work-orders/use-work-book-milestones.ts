import { QueryFunction, useQuery } from "@tanstack/react-query"

import type { MILESTONE_STATUS } from "@prisma/client"

export interface Milestone {
	id: string
	name: string
	description: string | null
	order: number
	closureComment: string | null
	isCompleted: boolean
	status: MILESTONE_STATUS
	weight: number
	startDate: Date | null
	endDate: Date | null
	workOrderId: string
	createdAt: string
	updatedAt: string
	activities: Array<{
		id: string
		executionDate: Date
		activityName: string
		comments: string | null
		activityEndTime: string | null
		activityStartTime: string | null
		_count: {
			assignedUsers: number
		}
	}>
}

export const fetchWorkBookMilestones: QueryFunction<
	MilestonesResponse,
	readonly ["workBookMilestones", { workOrderId: string; showAll?: boolean }]
> = async ({ queryKey }) => {
	const [, { workOrderId, showAll }] = queryKey

	if (!workOrderId) {
		throw new Error("WorkOrder ID is required")
	}

	const searchParams = new URLSearchParams()
	if (showAll) searchParams.set("showAll", showAll.toString())

	const res = await fetch(`/api/work-book/${workOrderId}/milestones?${searchParams.toString()}`)

	if (!res.ok) {
		throw new Error("Error fetching milestones")
	}

	return res.json()
}

interface MilestoneParams {
	workOrderId: string
	showAll?: boolean
}

interface MilestonesResponse {
	milestones: Milestone[]
}

export const useWorkBookMilestones = ({ workOrderId, showAll }: MilestoneParams) => {
	return useQuery<MilestonesResponse>({
		queryKey: ["workBookMilestones", { workOrderId, showAll }],
		queryFn: (fn) =>
			fetchWorkBookMilestones({
				...fn,
				queryKey: ["workBookMilestones", { workOrderId, showAll }],
			}),
		enabled: !!workOrderId,
	})
}
