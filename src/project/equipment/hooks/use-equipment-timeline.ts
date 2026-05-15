import { useInfiniteQuery } from "@tanstack/react-query"

import type { EquipmentTimelineResponse } from "@/project/equipment/types/equipment-timeline"

async function fetchEquipmentTimelinePage(
	equipmentId: string,
	pageParam: string | null
): Promise<EquipmentTimelineResponse> {
	const searchParams = new URLSearchParams()
	searchParams.set("limit", "100")
	if (pageParam) {
		searchParams.set("cursor", pageParam)
	}

	const res = await fetch(
		`/api/equipments/${equipmentId}/timeline?${searchParams.toString()}`
	)

	if (!res.ok) {
		throw new Error("Error al obtener historial del equipo")
	}

	return res.json() as Promise<EquipmentTimelineResponse>
}

export function useEquipmentTimeline(equipmentId: string | null) {
	return useInfiniteQuery({
		queryKey: ["equipment-timeline", equipmentId] as const,
		queryFn: ({ pageParam }) =>
			fetchEquipmentTimelinePage(equipmentId!, pageParam),
		getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
		initialPageParam: null as string | null,
		enabled: !!equipmentId,
		staleTime: 5 * 60 * 1000,
	})
}
