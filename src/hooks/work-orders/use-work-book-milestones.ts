import { useQuery } from "@tanstack/react-query"

export interface MilestoneTask {
	id: string
	name: string
	description: string | null
	order: number
	isCompleted: boolean
	currentProgress: number
	estimatedHours: number | null
	completedHours: number
	estimatedPeople: number | null
	weight: number
	startDate: Date | null
	endDate: Date | null
	completedAt: Date | null
	autoComplete?: boolean
	milestoneId: string
	createdAt: string
	updatedAt: string
}

export interface Milestone {
	id: string
	name: string
	description: string | null
	order: number
	isCompleted: boolean
	progress: number
	weight: number
	startDate: Date | null
	endDate: Date | null
	workOrderId: string
	createdAt: string
	updatedAt: string
	tasks: MilestoneTask[]
}

interface MilestonesResponse {
	milestones: Milestone[]
}

export const useWorkBookMilestones = (workOrderId: string) => {
	return useQuery<MilestonesResponse>({
		queryKey: ["workBookMilestones", workOrderId],
		queryFn: async () => {
			if (!workOrderId) {
				throw new Error("WorkOrder ID is required")
			}

			const res = await fetch(`/api/work-book/${workOrderId}/milestones`)

			if (!res.ok) {
				throw new Error("Error fetching milestones")
			}

			return res.json()
		},
		enabled: !!workOrderId,
	})
}
