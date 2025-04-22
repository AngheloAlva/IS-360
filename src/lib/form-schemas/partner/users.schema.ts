import { z } from "zod"

import { rutRegex } from "../rutRegex"

export const partnerUsersSchema = z.object({
	employees: z
		.array(
			z.object({
				name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
				email: z.string().email({ message: "El correo electrónico debe ser válido" }),
				phone: z.string().optional(),
				rut: z.string().regex(rutRegex, { message: "El RUT no es válido" }),
			})
		)
		.min(1, { message: "Debe agregar al menos un personal" }),
})

export type PartnerUsersSchema = z.infer<typeof partnerUsersSchema>
