export const USER_ROLES_VALUES = {
	ADMIN: "ADMIN",
	SUPERADMIN: "SUPERADMIN",
	USER: "USER",
	PARTNER_COMPANY: "PARTNER_COMPANY",
	OPERATOR: "OPERATOR",
} as const

export const USER_ROLES_VALUES_ARRAY = [
	USER_ROLES_VALUES.SUPERADMIN,
	USER_ROLES_VALUES.ADMIN,
	USER_ROLES_VALUES.USER,
	USER_ROLES_VALUES.OPERATOR,
	USER_ROLES_VALUES.PARTNER_COMPANY,
] as const

export const UserRoleOptions = [
	{
		value: USER_ROLES_VALUES.SUPERADMIN,
		label: "Super Administrador",
	},
	{
		value: USER_ROLES_VALUES.ADMIN,
		label: "Administrador",
	},
	{
		value: USER_ROLES_VALUES.USER,
		label: "Usuario OTC",
	},
	{
		value: USER_ROLES_VALUES.OPERATOR,
		label: "Operador",
	},
	{
		value: USER_ROLES_VALUES.PARTNER_COMPANY,
		label: "Empresa Colaboradora",
	},
]
