import type {
	WORK_ORDER_CAPEX,
	WORK_ORDER_PRIORITY,
	WORK_ORDER_STATUS,
	WORK_ORDER_TYPE,
	WORK_REQUEST_STATUS,
} from "@/generated/prisma/enums"

// ─── Event type discriminator ───────────────────────────────────────────────

export const TIMELINE_EVENT_TYPES = {
	WORK_REQUEST: "WORK_REQUEST",
	WORK_ORDER: "WORK_ORDER",
} as const

export type TimelineEventType = (typeof TIMELINE_EVENT_TYPES)[keyof typeof TIMELINE_EVENT_TYPES]

// ─── Shared base ─────────────────────────────────────────────────────────────

interface TimelineEventBase {
	id: string
	type: TimelineEventType
	/** ISO date string — used for sorting and cursor pagination */
	date: string
	title: string
	parentWorkRequestId: string | null
	parentPlanTaskId: string | null
	planName: string | null
	responsible: { id: string; name: string } | null
}

// ─── WorkRequest (ST) event ──────────────────────────────────────────────────

export interface WorkRequestTimelineEvent extends TimelineEventBase {
	type: typeof TIMELINE_EVENT_TYPES.WORK_REQUEST
	status: WORK_REQUEST_STATUS
	workRequestNumber: string
	isUrgent: boolean
	workOrderType: null
	capex: null
	counts: null
}

// ─── WorkOrder (OT) event ────────────────────────────────────────────────────

export interface WorkOrderTimelineEvent extends TimelineEventBase {
	type: typeof TIMELINE_EVENT_TYPES.WORK_ORDER
	status: WORK_ORDER_STATUS
	otNumber: string
	workOrderType: WORK_ORDER_TYPE
	priority: WORK_ORDER_PRIORITY
	capex: WORK_ORDER_CAPEX | null
	counts: {
		milestones: number
		workEntries: number
		inspections: number
	}
}

// ─── Union ───────────────────────────────────────────────────────────────────

export type EquipmentTimelineEvent = WorkRequestTimelineEvent | WorkOrderTimelineEvent

// ─── API response shape ──────────────────────────────────────────────────────

export interface EquipmentTimelineResponse {
	events: EquipmentTimelineEvent[]
	/** ISO date string of the last returned event, or null when no more pages */
	nextCursor: string | null
	hasMore: boolean
}
