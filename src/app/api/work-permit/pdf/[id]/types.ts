import type { WorkPermit } from "@prisma/client"

export interface WorkPermitData extends WorkPermit {
	otNumber?: {
		otNumber: string
		workName?: string
		workRequest: string
		workDescription: string
		supervisor: {
			name: string
			rut: string
		}
		responsible: {
			name: string
			rut: string
		}
	}
	user: {
		name: string
		rut: string
		internalRole: string
	}
	company: {
		name: string
		rut: string
	}
	participants: {
		name: string
		rut: string
		internalRole: string
	}[]
}
