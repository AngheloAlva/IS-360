import { MODULES, USER_ROLE } from "@prisma/client"

export interface ApiUser {
	id: string
	name: string
	email: string
	rut: string
	role: USER_ROLE
	phone: string
	internalRole: string
	modules: MODULES[]
	area: string | null
	createdAt: string
	isSupervisor: boolean
	company: {
		name: string
	} | null
}
