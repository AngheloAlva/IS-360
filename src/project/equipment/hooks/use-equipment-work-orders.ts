import { useQuery, type UseQueryOptions } from "@tanstack/react-query"

import type { Company, WORK_ORDER_STATUS } from "@prisma/client"

interface WorkOrderUser {
	id: string
	name: string
	email: string
}

export interface EquipmentWorkOrder {
	id: string
	otNumber: string
	type: string
	status: WORK_ORDER_STATUS
	solicitationDate: string
	solicitationTime: string
	startDate: string | null
	endDate: string | null
	description: string
	responsible: WorkOrderUser | null
	supervisor: WorkOrderUser | null
	company: Company
}

interface UseEquipmentWorkOrdersOptions {
	enabled?: boolean
	limit?: number
}

export const useEquipmentWorkOrders = (
	equipmentId: string,
	options?: UseEquipmentWorkOrdersOptions &
		Omit<UseQueryOptions<EquipmentWorkOrder[]>, "queryKey" | "queryFn">
) => {
	const { limit = 5, enabled = true, ...queryOptions } = options || {}

	return useQuery<EquipmentWorkOrder[]>({
		queryKey: ["equipment", equipmentId, "work-orders", { limit }],
		queryFn: async () => {
			if (!equipmentId) return []

			const searchParams = new URLSearchParams()
			searchParams.set("limit", limit.toString())

			const res = await fetch(
				`/api/equipments/${equipmentId}/work-orders?${searchParams.toString()}`
			)
			if (!res.ok) throw new Error("Error fetching equipment work orders")

			return res.json()
		},
		enabled: !!equipmentId && enabled,
		...queryOptions,
	})
}
