import { WorkBookEntry as WorkBookEntryPrisma } from "@prisma/client"

export interface WorkBookEntry extends WorkBookEntryPrisma {
	createdBy: {
		name: string
		role: string
		internalRole: string
	}
	assignedUsers: {
		name: string
		role: string
		internalRole: string
	}[]
	reportedUsers?: {
		name: string
		role: string
		internalRole: string
	}[]
}
