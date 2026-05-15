import type { WorkOrder, WorkEntry, Milestone } from "@/generated/prisma/client"

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
		location: { id: string; name: string; path: string }
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
		attachments?: {
			id: string
			name: string
			url: string
			type: string
			sasUrl?: string
		}[]
	})[]
}
