import { useQuery } from "@tanstack/react-query"

import type {
	WORK_ORDER_CAPEX,
	WORK_ORDER_PRIORITY,
	WORK_ORDER_STATUS,
	WORK_ORDER_TYPE,
} from "@/generated/prisma/enums"

export interface MaintenanceTaskWorkOrder {
	id: string
	otNumber: string
	status: WORK_ORDER_STATUS
	createdAt: Date
	programDate: Date
	estimatedDays: number
	estimatedHours: number
	workRequest: string
	workDescription: string | null
	capex: WORK_ORDER_CAPEX | null
	type: WORK_ORDER_TYPE
	priority: WORK_ORDER_PRIORITY
	company: {
		id: string
		name: string
	} | null
	responsible: {
		id: string
		name: string
	}
	supervisor: {
		id: string
		name: string
	}
}

export interface MaintenanceTaskTimelineItem {
	id: string
	otNumber: string
	status: WORK_ORDER_STATUS
	programDate: Date
	createdAt: Date
}

interface MaintenanceTaskWorkOrdersResponse {
	workOrders: MaintenanceTaskWorkOrder[]
	timeline: MaintenanceTaskTimelineItem[]
	total: number
	pages: number
	page: number
	limit: number
}

export const useMaintenanceTaskWorkOrders = ({
	planSlug,
	taskId,
	page = 1,
	limit = 5,
	enabled,
}: {
	planSlug: string
	taskId?: string
	page?: number
	limit?: number
	enabled: boolean
}) => {
	return useQuery<MaintenanceTaskWorkOrdersResponse>({
		queryKey: ["maintenance-task-work-orders", planSlug, taskId, page, limit],
		queryFn: async () => {
			const response = await fetch(
				`/api/maintenance-plan/${planSlug}/tasks/${taskId}/work-orders?page=${page}&limit=${limit}`
			)

			if (!response.ok) {
				throw new Error("Error fetching maintenance task work orders")
			}

			return response.json()
		},
		enabled: enabled && Boolean(planSlug) && Boolean(taskId),
	})
}
