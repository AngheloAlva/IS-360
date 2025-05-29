import { Company, User, WorkOrder, WorkPermit } from "@prisma/client"

export interface WorkPermitData extends WorkPermit {
	otNumber: WorkOrder
	user: User
	company: Company
	participants: User[]
}
