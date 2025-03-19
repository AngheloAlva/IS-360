import { z } from "zod"

import { rutRegex } from "../../rutRegex"

export const companySchema = z.object({
	name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
	rut: z.string().regex(rutRegex, { message: "El RUT no es válido" }),
})

export type CompanySchema = z.infer<typeof companySchema>
