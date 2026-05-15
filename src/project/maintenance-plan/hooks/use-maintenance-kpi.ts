import { useQuery } from "@tanstack/react-query"

import type { MaintenanceKpiResponse, MaintenanceKpiFilters } from "@/project/maintenance-plan/types/kpi"
import { useKpiFilters } from "@/project/maintenance-plan/stores/maintenance-kpi-filters.store"

export type { MaintenanceKpiResponse }

function buildKpiUrl(filters: MaintenanceKpiFilters): string {
	const params = new URLSearchParams()
	if (filters.dateFrom) params.set("dateFrom", filters.dateFrom)
	if (filters.dateTo) params.set("dateTo", filters.dateTo)
	if (filters.specialty) params.set("specialty", filters.specialty)
	if (filters.taskType) params.set("taskType", filters.taskType)
	if (filters.equipmentId) params.set("equipmentId", filters.equipmentId)
	if (filters.maintenancePlanId) params.set("maintenancePlanId", filters.maintenancePlanId)
	const qs = params.toString()
	return `/api/maintenance-plan/kpi${qs ? `?${qs}` : ""}`
}

export function useMaintenanceKpi() {
	const filters = useKpiFilters()

	return useQuery<MaintenanceKpiResponse>({
		queryKey: ["maintenance-kpi", filters],
		queryFn: async () => {
			const res = await fetch(buildKpiUrl(filters))
			if (!res.ok) throw new Error("Error fetching maintenance KPIs")
			return res.json()
		},
		refetchOnWindowFocus: false,
		staleTime: 5 * 60 * 1000,
	})
}
