import { z } from "zod"

import { rutRegex } from "../../rutRegex"

export const userSchema = z.object({
	name: z.string().min(2, { message: "El nombre de la empresa debe tener al menos 2 caracteres" }),
	email: z.string().email({ message: "El correo electrónico debe ser válido" }),
	rut: z.string().regex(rutRegex, { message: "El RUT no es válido" }),
	role: z.enum(["SUPERADMIN", "ADMIN", "USER", "PARTNER_COMPANY"]),
})

export type UserSchema = z.infer<typeof userSchema>
