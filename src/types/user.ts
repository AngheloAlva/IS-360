import { USER_ROLES_VALUES } from "@/lib/consts/user-roles"
import { OTC_INTERNAL_ROLES_VALUES } from "@/lib/consts/internal-roles"

export interface ApiUser {
	id: string
	name: string
	email: string
	rut: string
	role: keyof typeof USER_ROLES_VALUES
	internalRole: keyof typeof OTC_INTERNAL_ROLES_VALUES
	area: string | null
	createdAt: string
	isSupervisor: boolean
	company: {
		name: string
	} | null
}
