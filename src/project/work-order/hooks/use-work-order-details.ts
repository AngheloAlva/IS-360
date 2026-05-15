import { useQuery } from "@tanstack/react-query"

import type {
	WORK_ORDER_CAPEX,
	WORK_ORDER_PRIORITY,
	WORK_ORDER_STATUS,
	WORK_ORDER_TYPE,
	WORK_REQUEST_STATUS,
} from "@/generated/prisma/enums"

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
	rescheduledEndDate: Date | null
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
	workRequested: {
		id: string
		requestNumber: string
		description: string
		status: WORK_REQUEST_STATUS
	} | null
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
			const raw = await res.json()
			return {
				...raw,
				createdAt: new Date(raw.createdAt),
				programDate: new Date(raw.programDate),
				solicitationDate: new Date(raw.solicitationDate),
				estimatedEndDate: raw.estimatedEndDate ? new Date(raw.estimatedEndDate) : null,
				rescheduledEndDate: raw.rescheduledEndDate ? new Date(raw.rescheduledEndDate) : null,
				endReport: raw.endReport
					? { ...raw.endReport, createdAt: new Date(raw.endReport.createdAt) }
					: null,
			} satisfies WorkOrderDetails
		},
		enabled: !!workOrderId,
		staleTime: 5 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
	})
}
