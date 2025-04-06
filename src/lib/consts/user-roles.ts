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

export const UserRolesLabels = {
	SUPERADMIN: "Super Administrador",
	ADMIN: "Administrador",
	USER: "Usuario OTC",
	OPERATOR: "Operador",
	PARTNER_COMPANY: "Empresa Colaboradora",
} as const

export const UserRoleOptions = [
	{
		value: USER_ROLES_VALUES.SUPERADMIN,
		label: UserRolesLabels.SUPERADMIN,
	},
	{
		value: USER_ROLES_VALUES.ADMIN,
		label: UserRolesLabels.ADMIN,
	},
	{
		value: USER_ROLES_VALUES.USER,
		label: UserRolesLabels.USER,
	},
]
