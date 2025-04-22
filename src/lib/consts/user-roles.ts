export const USER_ROLES_VALUES = {
	USER: "USER",
	ADMIN: "ADMIN",
	OPERATOR: "OPERATOR",
	SUPERVISOR: "SUPERVISOR",
	PARTNER_COMPANY: "PARTNER_COMPANY",
} as const

export const USER_ROLES_VALUES_ARRAY = [
	USER_ROLES_VALUES.USER,
	USER_ROLES_VALUES.ADMIN,
	USER_ROLES_VALUES.OPERATOR,
	USER_ROLES_VALUES.SUPERVISOR,
	USER_ROLES_VALUES.PARTNER_COMPANY,
] as const

export const UserRolesLabels = {
	OPERATOR: "Operador",
	ADMIN: "Administrador",
	USER: "Acceso Tecnico",
	SUPERVISOR: "Supervisor Externo",
	PARTNER_COMPANY: "Empresa Colaboradora",
} as const

export const InternalUserRoleOptions = [
	{
		value: USER_ROLES_VALUES.ADMIN,
		label: UserRolesLabels.ADMIN,
	},
	{
		value: USER_ROLES_VALUES.USER,
		label: UserRolesLabels.USER,
	},
]
