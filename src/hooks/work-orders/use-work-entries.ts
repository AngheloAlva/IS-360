import { useQuery } from "@tanstack/react-query"

import type { ENTRY_TYPE } from "@prisma/client"

export interface WorkEntry {
	id: string
	activityName: string
	comments: string
	createdAt: string
	activityStartTime: string
	activityEndTime: string
	supervisionComments: string
	safetyObservations: string
	nonConformities: string
	inspectorName: string
	recommendations: string
	executionDate: Date
	entryType: ENTRY_TYPE
	others: string
	createdBy: {
		name: string
	}
	workOrder?: {
		id: string
		workName: string
	}
	assignedUsers: {
		id: string
		name: string
		email: string
		rut: string
		role: string
		area: string
		isSupervisor: boolean
	}[]
	attachments: {
		url: string
		name: string
		createdAt: string
	}[]
	milestone: {
		id: string
		name: string
	}
}

interface UseWorkEntriesParams {
	page?: number
	limit?: number
	search?: string
	workOrderId?: string
	milestone?: string | null
}

interface WorkEntriesResponse {
	entries: WorkEntry[]
	milestones: {
		id: string
		name: string
	}[]
	total: number
	pages: number
}

export const useWorkEntries = ({
	page = 1,
	milestone,
	limit = 10,
	search = "",
	workOrderId,
}: UseWorkEntriesParams = {}) => {
	return useQuery<WorkEntriesResponse>({
		queryKey: ["work-entries", { page, limit, search, workOrderId, milestone }],
		queryFn: async () => {
			const searchParams = new URLSearchParams()
			searchParams.set("page", page.toString())
			searchParams.set("limit", limit.toString())
			if (search) searchParams.set("search", search)
			if (milestone) searchParams.set("milestone", milestone)
			if (workOrderId) searchParams.set("workOrderId", workOrderId)

			const res = await fetch(`/api/work-book/entries?${searchParams.toString()}`)
			if (!res.ok) throw new Error("Error fetching work entries")

			return res.json()
		},
	})
}
