import { WorkEntry as WorkEntryPrisma } from "@/generated/prisma/client"

export interface WorkEntry extends WorkEntryPrisma {
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
}
