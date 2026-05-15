import { useMemo } from "react"
import { useQueries } from "@tanstack/react-query"

import { fetchEquipments, type WorkEquipment } from "@/project/equipment/hooks/use-equipments"
import { useLocations } from "@/project/location/hooks/use-locations"

export function useUnifiedTreeData(expandedLocationIds: Set<string>) {
	const locationsQuery = useLocations()

	const expandedIds = Array.from(expandedLocationIds)

	const equipmentQueries = useQueries({
		queries: expandedIds.map((locationId) => ({
			queryKey: ["equipments", { locationId, rootOnly: true, showAll: true }],
			queryFn: () =>
				fetchEquipments({
					page: 1,
					limit: 1000,
					search: "",
					parentId: null,
					locationId,
					rootOnly: true,
					showAll: true,
					orderBy: "name",
					order: "asc",
				}),
			staleTime: 30_000,
		})),
	})

	// Stable dependency array for the equipmentMap memo — rebuild only when any query's data changes
	const dataUpdatedAtKey = equipmentQueries.map((q) => q.dataUpdatedAt).join(",")

	const equipmentMap = useMemo(() => {
		const map = new Map<string, WorkEquipment>()
		for (const q of equipmentQueries) {
			if (!q.data?.equipments) continue
			for (const eq of q.data.equipments) map.set(eq.id, eq)
		}
		return map
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [dataUpdatedAtKey])

	return {
		locations: locationsQuery.data ?? [],
		isLoading: locationsQuery.isLoading,
		isError: locationsQuery.isError,
		equipmentMap,
	}
}
