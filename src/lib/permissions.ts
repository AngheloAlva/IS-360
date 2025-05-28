import { defaultStatements, adminAc } from "better-auth/plugins/admin/access"
import { createAccessControl } from "better-auth/plugins/access"

export const statement = {
	...defaultStatements,
	maintenancePlan: ["create", "update", "delete", "list"],
	workOrder: ["create", "update", "delete", "list"],
	startupFolder: ["create", "update", "delete", "list"],
	workPermit: ["create", "update", "delete", "list"],
	workBook: ["create", "update", "delete", "list"],
	safetyTalk: ["create", "update", "delete", "list"],
	documentation: ["create", "update", "delete", "list"],
	equipment: ["create", "update", "delete", "list"],
	company: ["create", "update", "delete", "list"],
} as const

export const ac = createAccessControl(statement)

export const admin = ac.newRole({
	...adminAc.statements,
	maintenancePlan: ["create", "update", "delete", "list"],
	workOrder: ["create", "update", "delete", "list"],
	startupFolder: ["create", "update", "delete", "list"],
	workPermit: ["create", "update", "delete", "list"],
	workBook: ["create", "update", "delete", "list"],
	safetyTalk: ["create", "update", "delete", "list"],
	documentation: ["create", "update", "delete", "list"],
	equipment: ["create", "update", "delete", "list"],
	company: ["create", "update", "delete", "list"],
})

export const user = ac.newRole({
	maintenancePlan: ["list"],
	workOrder: ["list"],
	startupFolder: ["list"],
	workPermit: ["list"],
	workBook: ["list"],
	safetyTalk: ["list"],
	documentation: ["list"],
	equipment: ["list"],
	company: ["list"],
	user: ["list"],
})

export const maintenancePlanOperator = ac.newRole({
	maintenancePlan: ["list", "create", "update", "delete"],
	workOrder: ["list"],
	startupFolder: ["list"],
	workPermit: ["list"],
	workBook: ["list"],
	safetyTalk: ["list"],
	documentation: ["list"],
	equipment: ["list"],
	company: ["list"],
	user: ["list"],
})

export const workOrderOperator = ac.newRole({
	maintenancePlan: ["list"],
	workOrder: ["list", "create", "update", "delete"],
	startupFolder: ["list"],
	workPermit: ["list"],
	workBook: ["list"],
	safetyTalk: ["list"],
	documentation: ["list"],
	equipment: ["list"],
	company: ["list"],
	user: ["list"],
})

export const startupFolderOperator = ac.newRole({
	maintenancePlan: ["list"],
	workOrder: ["list"],
	startupFolder: ["list", "create", "update", "delete"],
	workPermit: ["list"],
	workBook: ["list"],
	safetyTalk: ["list"],
	documentation: ["list"],
	equipment: ["list"],
	company: ["list"],
	user: ["list"],
})

export const workPermitOperator = ac.newRole({
	maintenancePlan: ["list"],
	workOrder: ["list"],
	startupFolder: ["list"],
	workPermit: ["list", "create", "update", "delete"],
	workBook: ["list"],
	safetyTalk: ["list"],
	documentation: ["list"],
	equipment: ["list"],
	company: ["list"],
	user: ["list"],
})

export const workBookOperator = ac.newRole({
	maintenancePlan: ["list"],
	workOrder: ["list"],
	startupFolder: ["list"],
	workPermit: ["list"],
	workBook: ["list", "create", "update", "delete"],
	safetyTalk: ["list"],
	documentation: ["list"],
	equipment: ["list"],
	company: ["list"],
	user: ["list"],
})

export const safetyTalkOperator = ac.newRole({
	maintenancePlan: ["list"],
	workOrder: ["list"],
	startupFolder: ["list"],
	workPermit: ["list"],
	workBook: ["list"],
	safetyTalk: ["list", "create", "update", "delete"],
	documentation: ["list"],
	equipment: ["list"],
	company: ["list"],
	user: ["list"],
})

export const documentationOperator = ac.newRole({
	maintenancePlan: ["list"],
	workOrder: ["list"],
	startupFolder: ["list"],
	workPermit: ["list"],
	workBook: ["list"],
	safetyTalk: ["list"],
	documentation: ["list", "create", "update", "delete"],
	equipment: ["list"],
	company: ["list"],
	user: ["list"],
})

export const equipmentOperator = ac.newRole({
	maintenancePlan: ["list"],
	workOrder: ["list"],
	startupFolder: ["list"],
	workPermit: ["list"],
	workBook: ["list"],
	safetyTalk: ["list"],
	documentation: ["list"],
	equipment: ["list", "create", "update", "delete"],
	company: ["list"],
	user: ["list"],
})

export const companyOperator = ac.newRole({
	maintenancePlan: ["list"],
	workOrder: ["list"],
	startupFolder: ["list"],
	workPermit: ["list"],
	workBook: ["list"],
	safetyTalk: ["list"],
	documentation: ["list"],
	equipment: ["list"],
	company: ["list", "create", "update", "delete"],
	user: ["list"],
})

export const userOperator = ac.newRole({
	maintenancePlan: ["list"],
	workOrder: ["list"],
	startupFolder: ["list"],
	workPermit: ["list"],
	workBook: ["list"],
	safetyTalk: ["list"],
	documentation: ["list"],
	equipment: ["list"],
	company: ["list"],
	user: ["list", "create", "delete", "set-role"],
})

export const partnerCompany = ac.newRole({
	maintenancePlan: [],
	workOrder: [],
	startupFolder: [],
	workPermit: [],
	workBook: [],
	safetyTalk: [],
	documentation: [],
	equipment: [],
	company: [],
	user: ["list", "create", "delete", "set-role"],
})

export const USER_ROLE = {
	user: "user",
	admin: "admin",
	maintenancePlanOperator: "maintenancePlanOperator",
	workOrderOperator: "workOrderOperator",
	startupFolderOperator: "startupFolderOperator",
	workPermitOperator: "workPermitOperator",
	workBookOperator: "workBookOperator",
	safetyTalkOperator: "safetyTalkOperator",
	documentationOperator: "documentationOperator",
	equipmentOperator: "equipmentOperator",
	companyOperator: "companyOperator",
	userOperator: "userOperator",
}

export const USER_ROLE_LABELS = {
	[USER_ROLE.user]: "Solo lectura",
	[USER_ROLE.admin]: "Administrador",
	[USER_ROLE.maintenancePlanOperator]: "Planes de Mantenimiento",
	[USER_ROLE.workOrderOperator]: "Ordenes de Trabajo",
	[USER_ROLE.startupFolderOperator]: "Carpetas de Arranque",
	[USER_ROLE.workPermitOperator]: "Permisos de Trabajo",
	[USER_ROLE.workBookOperator]: "Libros de Obra",
	[USER_ROLE.safetyTalkOperator]: "Charlas de Seguridad",
	[USER_ROLE.documentationOperator]: "Documentación",
	[USER_ROLE.equipmentOperator]: "Equipos",
	[USER_ROLE.companyOperator]: "Empresas",
	[USER_ROLE.userOperator]: "Usuarios",
}

export const USER_ROLE_ARRAY = [
	"user",
	"admin",
	"maintenancePlanOperator",
	"workOrderOperator",
	"startupFolderOperator",
	"workPermitOperator",
	"workBookOperator",
	"safetyTalkOperator",
	"documentationOperator",
	"equipmentOperator",
	"companyOperator",
	"userOperator",
] as const
