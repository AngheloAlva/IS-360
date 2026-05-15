import type { TASK_SPECIALTY, TASK_TYPE } from "@/generated/prisma/enums"
import { useShallow } from "zustand/react/shallow"
import { create } from "zustand"

import type { MaintenanceKpiFilters } from "@/project/maintenance-plan/types/kpi"

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getCurrentMonthRange(): { dateFrom: string; dateTo: string } {
	const now = new Date()
	const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
	const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
	return {
		dateFrom: firstDay.toISOString(),
		dateTo: lastDay.toISOString(),
	}
}

// ─── State interface ──────────────────────────────────────────────────────────

interface MaintenanceKpiFiltersState extends MaintenanceKpiFilters {
	setFilter: <K extends keyof MaintenanceKpiFilters>(
		key: K,
		value: MaintenanceKpiFilters[K]
	) => void
	setDateRange: (from: string | null, to: string | null) => void
	/** Reset to current-month defaults */
	reset: () => void
	/** Clear everything to null = sin filtro */
	clearAll: () => void
}

const defaultState: MaintenanceKpiFilters = {
	...getCurrentMonthRange(),
	specialty: null,
	taskType: null,
	equipmentId: null,
	maintenancePlanId: null,
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useMaintenanceKpiFiltersStore = create<MaintenanceKpiFiltersState>()((set) => ({
	...defaultState,

	setFilter: (key, value) => set({ [key]: value }),

	setDateRange: (from, to) => set({ dateFrom: from, dateTo: to }),

	reset: () =>
		set({
			...getCurrentMonthRange(),
			specialty: null,
			taskType: null,
			equipmentId: null,
			maintenancePlanId: null,
		}),

	clearAll: () =>
		set({
			dateFrom: null,
			dateTo: null,
			specialty: null,
			taskType: null,
			equipmentId: null,
			maintenancePlanId: null,
		}),
}))

// ─── Selector hook ────────────────────────────────────────────────────────────

export function useKpiFilters(): MaintenanceKpiFilters {
	return useMaintenanceKpiFiltersStore(
		useShallow((s) => ({
			dateFrom: s.dateFrom,
			dateTo: s.dateTo,
			specialty: s.specialty,
			taskType: s.taskType,
			equipmentId: s.equipmentId,
			maintenancePlanId: s.maintenancePlanId,
		}))
	)
}

export function useKpiFilterActions() {
	return useMaintenanceKpiFiltersStore(
		useShallow((s) => ({
			setFilter: s.setFilter,
			setDateRange: s.setDateRange,
			reset: s.reset,
			clearAll: s.clearAll,
		}))
	)
}

// Needed for accessing TASK_SPECIALTY / TASK_TYPE values at runtime in filter bar
export type { TASK_SPECIALTY, TASK_TYPE }
