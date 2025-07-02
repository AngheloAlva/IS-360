import { Company, User, WorkOrder, WorkPermit } from "@prisma/client"

export interface WorkPermitData extends WorkPermit {
	otNumber: WorkOrder & {
		supervisor: {
			name: string
			rut: string
		}
		responsible: {
			name: string
			rut: string
		}
	}
	user: User
	company: Company
	participants: User[]
}
