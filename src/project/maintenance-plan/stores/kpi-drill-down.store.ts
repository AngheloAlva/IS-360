import { create } from "zustand"
import { useShallow } from "zustand/react/shallow"

import type { DrillDownSegment, DrillDownSortBy, DrillDownSortDir } from "@/project/maintenance-plan/types/kpi-drill-down"

// ─── State interface ──────────────────────────────────────────────────────────

interface KpiDrillDownState {
	segment: DrillDownSegment | null
	open: boolean
	page: number
	sortBy: DrillDownSortBy
	sortDir: DrillDownSortDir
	// Actions
	openDrillDown: (segment: DrillDownSegment) => void
	close: () => void
	setPage: (page: number) => void
	setSort: (sortBy: DrillDownSortBy, sortDir: DrillDownSortDir) => void
}

// ─── Store ─────────────────────────────────────────────────────────────────────

export const useKpiDrillDownStore = create<KpiDrillDownState>()((set) => ({
	segment: null,
	open: false,
	page: 1,
	sortBy: "delayDays",
	sortDir: "desc",

	openDrillDown: (segment) => set({ segment, open: true, page: 1 }),
	close: () => set({ open: false }),
	setPage: (page) => set({ page }),
	setSort: (sortBy, sortDir) => set({ sortBy, sortDir, page: 1 }),
}))

// ─── Selector hooks ────────────────────────────────────────────────────────────

export function useKpiDrillDownState() {
	return useKpiDrillDownStore(
		useShallow((s) => ({
			segment: s.segment,
			open: s.open,
			page: s.page,
			sortBy: s.sortBy,
			sortDir: s.sortDir,
		}))
	)
}

export function useKpiDrillDownActions() {
	return useKpiDrillDownStore(
		useShallow((s) => ({
			openDrillDown: s.openDrillDown,
			close: s.close,
			setPage: s.setPage,
			setSort: s.setSort,
		}))
	)
}
