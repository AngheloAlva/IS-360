import { useQuery } from "@tanstack/react-query"

import type { WorkOrderSummaryResponse } from "@/project/work-order/types/work-order-summary"

async function fetchWorkOrderSummary(workOrderId: string): Promise<WorkOrderSummaryResponse> {
	const res = await fetch(`/api/work-order/${workOrderId}/summary`)

	if (!res.ok) {
		if (res.status === 404) {
			throw new Error("Orden de trabajo no encontrada")
		}
		throw new Error("Error al obtener resumen de la orden de trabajo")
	}

	return res.json() as Promise<WorkOrderSummaryResponse>
}

interface UseWorkOrderSummaryOptions {
	open?: boolean
}

export function useWorkOrderSummary(
	workOrderId: string | null,
	options: UseWorkOrderSummaryOptions = {}
) {
	const { open = true } = options

	return useQuery({
		queryKey: ["work-order-summary", workOrderId] as const,
		queryFn: () => fetchWorkOrderSummary(workOrderId!),
		enabled: open && !!workOrderId,
		staleTime: 5 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
	})
}
