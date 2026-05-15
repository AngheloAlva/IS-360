import type { DemoRole, DemoUser } from "./types"

export const DEMO_USERS: Record<DemoRole, DemoUser> = {
	admin: {
		id: "demo-admin",
		name: "Admin Demo",
		email: "admin@ingsimple.cl",
		role: "admin",
		accessRole: "ADMIN",
		isSupervisor: false,
		companyId: null,
	},
	"internal-tech": {
		id: "demo-tech",
		name: "Técnico Demo",
		email: "tecnico@ingsimple.cl",
		role: "internal-tech",
		accessRole: "ADMIN",
		isSupervisor: false,
		companyId: null,
	},
	supervisor: {
		id: "demo-supervisor",
		name: "Supervisor Demo",
		email: "supervisor@ingsimple.cl",
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
		title: "Técnico Interno",
		description:
			"Personal interno con acceso operativo: OTs, inspecciones, equipos y mantenimiento.",
	},
	supervisor: {
		title: "Supervisor Contratista",
		description:
			"Supervisor de una empresa contratista. Ve sus colaboradores, vehículos y permisos.",
	},
}
