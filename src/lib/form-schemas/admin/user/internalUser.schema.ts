import { z } from "zod"

import { DocumentAreasValuesArray, UserAreasValuesArray } from "@/lib/consts/areas"
import { rutRegex } from "@/lib/form-schemas/rutRegex"

export const internalUserSchema = z.object({
	name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
	email: z.string().email({ message: "El correo electrónico debe ser válido" }),
	phone: z.string().optional(),
	rut: z.string().regex(rutRegex, { message: "El RUT no es válido" }),
	role: z.array(z.string()).min(1, { message: "Debe seleccionar al menos un rol" }),
	internalRole: z.string().optional(),
	area: z.enum(UserAreasValuesArray).optional().nullable(),
	documentAreas: z.array(z.enum(DocumentAreasValuesArray)).optional(),
})

export type InternalUserSchema = z.infer<typeof internalUserSchema>
