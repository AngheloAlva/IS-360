import { useQuery, keepPreviousData } from "@tanstack/react-query"

import type { DrillDownResponse, DrillDownSegment } from "@/project/maintenance-plan/types/kpi-drill-down"
import type { MaintenanceKpiFilters } from "@/project/maintenance-plan/types/kpi"
import { useKpiFilters } from "@/project/maintenance-plan/stores/maintenance-kpi-filters.store"
import { useKpiDrillDownState } from "@/project/maintenance-plan/stores/kpi-drill-down.store"

// ─── URL builder ──────────────────────────────────────────────────────────────

function buildDrillDownUrl(
	segment: DrillDownSegment,
	filters: MaintenanceKpiFilters,
	page: number,
	pageSize: number,
	sortBy: string,
	sortDir: string
): string {
	const params = new URLSearchParams()
	params.set("segment", segment)
	if (filters.dateFrom) params.set("dateFrom", filters.dateFrom)
	if (filters.dateTo) params.set("dateTo", filters.dateTo)
	if (filters.specialty) params.set("specialty", filters.specialty)
	if (filters.taskType) params.set("taskType", filters.taskType)
	if (filters.equipmentId) params.set("equipmentId", filters.equipmentId)
	if (filters.maintenancePlanId) params.set("maintenancePlanId", filters.maintenancePlanId)
	params.set("page", String(page))
	params.set("pageSize", String(pageSize))
	params.set("sortBy", sortBy)
	params.set("sortDir", sortDir)
	return `/api/maintenance-plan/kpi/drill-down?${params.toString()}`
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

interface UseKpiDrillDownOptions {
	pageSize?: number
}

export function useKpiDrillDown({ pageSize = 50 }: UseKpiDrillDownOptions = {}) {
	const filters = useKpiFilters()
	const { segment, page, sortBy, sortDir } = useKpiDrillDownState()

	return useQuery<DrillDownResponse>({
		queryKey: ["kpi-drill-down", segment, filters, page, pageSize, sortBy, sortDir],
		queryFn: async () => {
			if (!segment) throw new Error("segment is required")
			const url = buildDrillDownUrl(segment, filters, page, pageSize, sortBy, sortDir)
			const res = await fetch(url)
			if (!res.ok) {
				const body = await res.json().catch(() => ({}))
				throw new Error(body?.error ?? "Error fetching drill-down data")
			}
			return res.json()
		},
		enabled: !!segment,
		staleTime: 2 * 60 * 1000,
		placeholderData: keepPreviousData,
		refetchOnWindowFocus: false,
	})
}

// ─── Export-all variant (cap at 2000 rows, user-confirmed) ────────────────────

export async function fetchDrillDownExport(
	segment: DrillDownSegment,
	filters: MaintenanceKpiFilters,
	sortBy: string,
	sortDir: string
): Promise<DrillDownResponse> {
	const url = buildDrillDownUrl(segment, filters, 1, 2000, sortBy, sortDir)
	const res = await fetch(url)
	if (!res.ok) {
		const body = await res.json().catch(() => ({}))
		throw new Error(body?.error ?? "Error fetching drill-down export data")
	}
	return res.json()
}
