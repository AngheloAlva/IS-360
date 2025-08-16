import { useQuery } from "@tanstack/react-query"

import type {
	WORK_ORDER_CAPEX,
	WORK_ORDER_PRIORITY,
	WORK_ORDER_STATUS,
	WORK_ORDER_TYPE,
} from "@prisma/client"

export interface WorkOrderDetails {
	id: string
	otNumber: string
	solicitationDate: Date
	type: WORK_ORDER_TYPE
	status: WORK_ORDER_STATUS
	capex: WORK_ORDER_CAPEX
	solicitationTime: string
	workRequest: string
	workDescription: string
	progress: number
	priority: WORK_ORDER_PRIORITY
	createdAt: Date
	programDate: Date
	estimatedHours: number | null
	estimatedDays: number | null
	estimatedEndDate: Date | null
	initReport: {
		url: string
		name: string
	} | null
	endReport: {
		url: string
		name: string
		createdAt: Date
	} | null
	equipments: {
		id: string
		name: string
	}[]
	company: {
		id: string
		name: string
		image: string | null
	} | null
	supervisor: {
		id: string
		name: string
	}
	responsible: {
		id: string
		name: string
	}
	_count: {
		workBookEntries: number
	}
	milestones: {
		id: string
		name: string
		status: string
		weight: number
	}[]
}

export const useWorkOrderDetails = (workOrderId: string | null) => {
	return useQuery<WorkOrderDetails>({
		queryKey: ["workOrderDetails", workOrderId] as const,
		queryFn: async ({ queryKey }) => {
			const [, id] = queryKey
			const res = await fetch(`/api/work-order/${id}/details`)
			if (!res.ok) {
				throw new Error("Error fetching work order details")
			}
			return res.json()
		},
		enabled: !!workOrderId,
		staleTime: 5 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
	})
}
