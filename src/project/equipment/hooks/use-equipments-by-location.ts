import { useQuery } from "@tanstack/react-query"

import { fetchEquipments, type EquipmentsResponse } from "@/project/equipment/hooks/use-equipments"

interface UseEquipmentsByLocationOptions {
	rootOnly?: boolean
	enabled?: boolean
}

export function useEquipmentsByLocation(locationId: string, opts: UseEquipmentsByLocationOptions = {}) {
	const { rootOnly = true, enabled = true } = opts

	return useQuery<EquipmentsResponse>({
		queryKey: ["equipments", { locationId, rootOnly, showAll: true }],
		queryFn: () =>
			fetchEquipments({
				page: 1,
				limit: 1000,
				search: "",
				parentId: null,
				locationId,
				rootOnly,
				showAll: true,
				orderBy: "name",
				order: "asc",
			}),
		enabled: enabled && !!locationId,
		staleTime: 30_000,
	})
}
