import { z } from "zod"

import { OTC_INTERNAL_ROLES_VALUES_ARRAY } from "@/lib/consts/internal-roles"
import { AreasValuesArray } from "@/lib/consts/areas"
import { rutRegex } from "../../rutRegex"
import { USER_ROLES_VALUES_ARRAY } from "@/lib/consts/user-roles"

export const internalUserSchema = z.object({
	name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
	email: z.string().email({ message: "El correo electrónico debe ser válido" }),
	phone: z.string().optional(),
	rut: z.string().regex(rutRegex, { message: "El RUT no es válido" }),
	role: z.enum(USER_ROLES_VALUES_ARRAY, { message: "El rol no es valido" }),
	internalRole: z.enum(OTC_INTERNAL_ROLES_VALUES_ARRAY).optional(),
	area: z.enum(AreasValuesArray).optional().nullable(),
})

export type InternalUserSchema = z.infer<typeof internalUserSchema>
