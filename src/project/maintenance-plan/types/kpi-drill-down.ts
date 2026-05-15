import type { TASK_SPECIALTY, TASK_TYPE, WORK_ORDER_STATUS } from "@/generated/prisma/enums"

// ─── Segment discriminated union ─────────────────────────────────────────────

export type DrillDownSegment = "on-time:late" | "on-time:ontime"

// ─── Row shape returned by the API ───────────────────────────────────────────

export interface DrillDownRow {
	id: string
	code: string // otNumber
	equipmentName: string | null
	equipmentId: string | null
	scheduledDate: string // estimatedEndDate ISO
	endDate: string | null
	delayDays: number // ceil((endDate - estimatedEndDate)/86400000); on-time rows ≤0
	status: WORK_ORDER_STATUS
	specialty: TASK_SPECIALTY | null
	responsibleName: string | null
	createdAt: string
	hasNoActivity: boolean
}

// ─── API response DTO ─────────────────────────────────────────────────────────

export interface DrillDownResponse {
	items: DrillDownRow[]
	total: number
	page: number
	pageSize: number
}

// ─── Sort fields ─────────────────────────────────────────────────────────────

export type DrillDownSortBy = "delayDays" | "estimatedEndDate" | "endDate" | "otNumber"
export type DrillDownSortDir = "asc" | "desc"

// ─── Re-export filter enums for convenience ───────────────────────────────────

export type { TASK_SPECIALTY, TASK_TYPE }
