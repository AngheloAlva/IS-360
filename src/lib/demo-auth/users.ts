import type { DemoRole, DemoUser } from "./types"

export const DEMO_USERS: Record<DemoRole, DemoUser> = {
	admin: {
		id: "demo-admin",
		name: "Admin Demo",
		email: "admin@cabonegro.cl",
		role: "admin",
		accessRole: "ADMIN",
		isSupervisor: false,
		companyId: null,
	},
	"internal-tech": {
		id: "demo-tech",
		name: "Técnico Demo",
		email: "tecnico@cabonegro.cl",
		role: "internal-tech",
		accessRole: "ADMIN",
		isSupervisor: false,
		companyId: null,
	},
	supervisor: {
		id: "demo-supervisor",
		name: "Supervisor Demo",
		email: "supervisor@petroaustral.cl",
		role: "supervisor",
		accessRole: "PARTNER_COMPANY",
		isSupervisor: true,
		companyId: "demo-company-1",
	},
}

export const DEMO_ROLE_LABELS: Record<DemoRole, { title: string; description: string }> = {
	admin: {
		title: "Admin",
		description:
			"Acceso completo a todos los módulos. Ideal para recorrer la plataforma punta a punta.",
	},
	"internal-tech": {
		title: "Técnico de Mantenimiento",
		description:
			"Personal interno de la refinería con acceso operativo: OTs, inspecciones, equipos y planes de mantenimiento.",
	},
	supervisor: {
		title: "Supervisor Contratista",
		description:
			"Supervisor de un contratista (PetroAustral). Ve a sus colaboradores, vehículos, permisos de trabajo y carpetas de arranque.",
	},
}
