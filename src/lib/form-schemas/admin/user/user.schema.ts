import { z } from "zod"

import { rutRegex } from "../../rutRegex"

export const userSchema = z.object({
	name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
	email: z.string().email({ message: "El correo electrónico debe ser válido" }),
	rut: z.string().regex(rutRegex, { message: "El RUT no es válido" }),
	role: z.enum(["SUPERADMIN", "ADMIN", "USER", "PARTNER_COMPANY"]),
	internalRole: z.enum([
		"GENERAL_SUPERVISOR",
		"AREA_SUPERVISOR",
		"PREVENTION_OFFICER",
		"OPERATIONS_MANAGER",
		"MAINTENANCE_SUPERVISOR",
		"ENVIRONMENTAL_SUPERVISOR",
		"QUALITY_SUPERVISOR",
		"NONE"
	]).optional(),
	area: z.enum([
		"OPERATIONS",
		"INSTRUCTIONS",
		"INTEGRITY_AND_MAINTENANCE",
		"ENVIRONMENT",
		"RISK_PREVENTION",
		"QUALITY_AND_PROFESSIONAL_EXCELLENCE",
		"HSEQ",
		"LEGAL",
		"COMMUNITIES"
	]).optional().nullable(),
})

export type UserSchema = z.infer<typeof userSchema>
