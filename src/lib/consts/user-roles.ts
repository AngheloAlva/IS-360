export const USER_ROLES_VALUES = {
	ADMIN: "ADMIN",
	PARTNER_COMPANY: "PARTNER_COMPANY",
} as const

export const USER_ROLES_VALUES_ARRAY = [
	USER_ROLES_VALUES.ADMIN,
	USER_ROLES_VALUES.PARTNER_COMPANY,
] as const

export const UserRolesLabels = {
	ADMIN: "Administrador",
	PARTNER_COMPANY: "Empresa Colaboradora",
} as const

export const InternalUserRoleOptions = [
	{
		value: USER_ROLES_VALUES.ADMIN,
		label: UserRolesLabels.ADMIN,
	},
	{
		value: USER_ROLES_VALUES.PARTNER_COMPANY,
		label: UserRolesLabels.PARTNER_COMPANY,
	},
]
