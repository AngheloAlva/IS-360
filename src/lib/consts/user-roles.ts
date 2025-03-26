export const USER_ROLES = {
	ADMIN: "ADMIN",
	SUPERADMIN: "SUPERADMIN",
	USER: "USER",
	PARTNER_COMPANY: "PARTNER_COMPANY",
	OPERATOR: "OPERATOR",
} as const

export type UserRole = keyof typeof USER_ROLES

export const UserRoleOptions = [
	{
		value: USER_ROLES.SUPERADMIN,
		label: "Super Administrador",
	},
	{
		value: USER_ROLES.ADMIN,
		label: "Administrador",
	},
	{
		value: USER_ROLES.USER,
		label: "Usuario OTC",
	},
	{
		value: USER_ROLES.OPERATOR,
		label: "Operador",
	},
]
