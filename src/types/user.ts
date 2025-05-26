import type { USER_ROLE_ARRAY } from "@/lib/permissions"
import type { MODULES } from "@prisma/client"

export interface ApiUser {
	id: string
	name: string
	email: string
	rut: string
	role: (typeof USER_ROLE_ARRAY)[number]
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
