export const USER_ROLES = {
	ADMIN: "ADMIN",
	SUPERADMIN: "SUPERADMIN",
	USER: "USER",
	PARTNER_COMPANY: "PARTNER_COMPANY",
} as const

export type UserRole = keyof typeof USER_ROLES
