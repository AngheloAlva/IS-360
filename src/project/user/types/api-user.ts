import type { USER_ROLE_ARRAY } from "@/lib/permissions"

export interface ApiUser {
	id: string
	name: string
	email: string
	rut: string
	image: string | null
	role: (typeof USER_ROLE_ARRAY)[number]
	phone: string
	internalRole: string
	area: string | null
	createdAt: string
	isSupervisor: boolean
	company: {
		name: string
	} | null
	documentAreas: string[]
}
