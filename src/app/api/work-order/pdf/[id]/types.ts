import type { WorkOrder, WorkEntry, Milestone } from "@prisma/client"

export interface WorkOrderPDFData extends WorkOrder {
	company?: {
		name: string
		rut: string
	}
	supervisor: {
		name: string
		rut: string
		internalRole?: string
	}
	responsible: {
		name: string
		rut: string
		internalRole?: string
	}
	equipment: {
		id: string
		name: string
		tag: string
		location: string
		description?: string
	}[]
	milestones: (Milestone & {
		activities: WorkEntry[]
	})[]
	workBookEntries: (WorkEntry & {
		createdBy: {
			name: string
			rut: string
		}
		milestone?: {
			name: string
		}
		assignedUsers: {
			name: string
			rut: string
		}[]
	})[]
}
