export type DemoRole = "admin" | "internal-tech" | "supervisor"

export type DemoUser = {
	id: string
	name: string
	email: string
	role: DemoRole
	accessRole: "ADMIN" | "PARTNER_COMPANY"
	isSupervisor: boolean
	companyId: string | null
}
