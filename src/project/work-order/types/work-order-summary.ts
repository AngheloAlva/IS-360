import type {
	WORK_ORDER_CAPEX,
	WORK_ORDER_PRIORITY,
	WORK_ORDER_STATUS,
	WORK_ORDER_TYPE,
} from "@/generated/prisma/enums"

// ─── Top-5 preview item shapes ───────────────────────────────────────────────

export interface MilestonePreview {
	id: string
	name: string
	status: string
	startDate: string
	endDate: string
}

export interface WorkEntryPreview {
	id: string
	activityName: string | null
	executionDate: string
	entryType: string
}

export interface InspectionPreview {
	id: string
	activityName: string | null
	executionDate: string
}

// ─── Main response ────────────────────────────────────────────────────────────

export interface WorkOrderSummaryResponse {
	id: string
	otNumber: string
	workRequest: string
	workDescription: string | null
	type: WORK_ORDER_TYPE
	status: WORK_ORDER_STATUS
	priority: WORK_ORDER_PRIORITY
	capex: WORK_ORDER_CAPEX | null
	programDate: string
	estimatedEndDate: string
	solicitationDate: string

	responsible: { id: string; name: string } | null
	supervisor: { id: string; name: string } | null

	/** Originating work request (ST) reference, if any */
	workRequested: { id: string; requestNumber: string } | null
	/** Originating maintenance plan task reference, if any */
	maintenancePlanTask: { id: string; name: string } | null

	_count: {
		milestones: number
		workEntries: number
		inspections: number
	}

	top5: {
		milestones: MilestonePreview[]
		workEntries: WorkEntryPreview[]
		inspections: InspectionPreview[]
	}
}
