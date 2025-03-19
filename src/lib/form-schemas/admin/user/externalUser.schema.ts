import { z } from "zod"

import { rutRegex } from "../../rutRegex"

export const externalUserSchema = z.object({
	name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
	email: z.string().email({ message: "El correo electrónico debe ser válido" }),
	rut: z.string().regex(rutRegex, { message: "El RUT no es válido" }),
	isSupervisor: z.boolean().optional(),
})

export type ExternalUserSchema = z.infer<typeof externalUserSchema>
