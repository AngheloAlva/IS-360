import type { TASK_SPECIALTY, TASK_TYPE } from "@/generated/prisma/enums"

// ─── Filter types ────────────────────────────────────────────────────────────

export interface MaintenanceKpiFilters {
	dateFrom: string | null // ISO string or null = no filter
	dateTo: string | null // ISO string or null = no filter
	specialty: TASK_SPECIALTY | null
	taskType: TASK_TYPE | null
	equipmentId: string | null
	maintenancePlanId: string | null
}

// ─── Response shape ──────────────────────────────────────────────────────────

export interface KpiCards {
	compliancePercent: number
	completedPreventiveWOs: number
	totalPreventiveWOs: number
	plansIncluded: number
	onTimePercent: number
	onTimeCount: number
	delayedCount: number
	avgClosureHours: number
	avgClosureDays: number
	avgWrResponseHours: number
}

export interface PreventiveVsCorrectivePoint {
	name: string
	month: string
	preventive: number
	corrective: number
	ratio: number
}

export interface OnTimePoint {
	name: string
	value: number
	fill: string
}

export interface BacklogChartPoint {
	name: string
	pendientes: number // PLANNED + PENDING
	enProgreso: number // IN_PROGRESS + CLOSURE_REQUESTED
	completadas: number // COMPLETED
	backlog: number | null // line: pendingHours / avgClosureHours — null when no closure data
}

export interface WrResponsePoint {
	name: string
	avgHours: number
	count: number
}

export interface MaintenanceKpiCharts {
	preventiveVsCorrective: PreventiveVsCorrectivePoint[]
	onTime: OnTimePoint[]
	backlog: BacklogChartPoint[]
	wrResponse: WrResponsePoint[]
}

export interface MaintenanceKpiResponse {
	cards: KpiCards
	charts: MaintenanceKpiCharts
}
