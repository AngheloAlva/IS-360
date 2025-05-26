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

export const integrityAndMaintenance = ac.newRole({
	maintenancePlan: ["list", "create", "update", "delete"],
	workOrder: ["list", "create", "update", "delete"],
	startupFolder: ["list"],
	workPermit: ["list"],
	workBook: ["list", "create", "update", "delete"],
	safetyTalk: ["list"],
	documentation: ["list"],
	equipment: ["list", "create", "update", "delete"],
	company: ["list"],
	user: ["list"],
})

export const regulatoryCompliance = ac.newRole({
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

export const qualityAndOperationalExcellence = ac.newRole({
	maintenancePlan: ["list"],
	workOrder: ["list", "create", "update", "delete"],
	startupFolder: ["list"],
	workPermit: ["list"],
	workBook: ["list", "create", "update", "delete"],
	safetyTalk: ["list"],
	documentation: ["list", "create", "update", "delete"],
	equipment: ["list", "create", "update", "delete"],
	company: ["list"],
	user: ["list"],
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
	user: [],
})

export const USER_ROLE = {
	user: "user",
	admin: "admin",
	regulatoryCompliance: "regulatoryCompliance",
	integrityAndMaintenance: "integrityAndMaintenance",
	qualityAndOperationalExcellence: "qualityAndOperationalExcellence",
}

export const USER_ROLE_LABELS = {
	[USER_ROLE.user]: "Usuario",
	[USER_ROLE.admin]: "Administrador",
	[USER_ROLE.regulatoryCompliance]: "Cumplimiento Regulatorio",
	[USER_ROLE.integrityAndMaintenance]: "Integridad y Mantenimiento",
	[USER_ROLE.qualityAndOperationalExcellence]: "Calidad y Excelencia Operacional",
}

export const USER_ROLE_ARRAY = [
	"user",
	"admin",
	"regulatoryCompliance",
	"integrityAndMaintenance",
	"qualityAndOperationalExcellence",
] as const

export const USER_ROLE_DESCRIPTIONS = {
	[USER_ROLE.user]: "Usuario: Acceso de solo lectura en toda la plataforma",
	[USER_ROLE.admin]: "Administrador: Acceso total a toda la plataforma",
	[USER_ROLE.regulatoryCompliance]:
		"Cumplimiento Regulatorio: Acceso de lectura en toda la plataforma y ",
	[USER_ROLE.integrityAndMaintenance]:
		"Integridad y Mantenimiento: Acceso a la información de mantenimiento y integridad",
	[USER_ROLE.qualityAndOperationalExcellence]:
		"Calidad y Excelencia Operacional: Acceso a la información de calidad y excelencia operacional",
}
