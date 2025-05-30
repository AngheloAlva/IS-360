import { z } from "zod"

import { rutRegex } from "../../rutRegex"

export const externalSupervisorsSchema = z.object({
	supervisors: z.array(
		z.object({
			name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
			email: z.string().email({ message: "El correo electrónico debe ser válido" }),
			rut: z.string().regex(rutRegex, { message: "El RUT no es válido" }),
			phone: z.string().optional(),
			internalArea: z.string().optional(),
			internalRole: z.string().optional(),
		})
	),
})

export type ExternalSupervisorsSchema = z.infer<typeof externalSupervisorsSchema>
