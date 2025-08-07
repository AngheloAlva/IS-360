import { z } from "zod"
import { rutRegex } from "@/shared/schemas/rutRegex"

export const externalCompanySchema = z.object({
	name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
	rut: z.string().regex(rutRegex, { message: "El RUT no es válido" }),
	emails: z
		.array(
			z.object({
				email: z.string().email({ message: "El correo electrónico debe ser válido" }),
			})
		)
		.min(1, { message: "Debe agregar al menos un correo electrónico" }),
})

export type ExternalCompanySchema = z.infer<typeof externalCompanySchema>

export const visitorDataSchema = z.object({
	name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
	rut: z.string().regex(rutRegex, { message: "El RUT no es válido" }),
	email: z.string().email({ message: "El correo electrónico debe ser válido" }),
})

export type VisitorDataSchema = z.infer<typeof visitorDataSchema>