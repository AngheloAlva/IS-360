import { z } from "zod"

import { USER_ROLES_VALUES_ARRAY } from "@/lib/consts/user-roles"
import { ModulesValuesArray } from "@/lib/consts/modules"
import { UserAreasValuesArray } from "@/lib/consts/areas"
import { rutRegex } from "../../rutRegex"

export const internalUserSchema = z.object({
	name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
	email: z.string().email({ message: "El correo electrónico debe ser válido" }),
	phone: z.string().optional(),
	rut: z.string().regex(rutRegex, { message: "El RUT no es válido" }),
	role: z.enum(USER_ROLES_VALUES_ARRAY, { message: "El rol no es valido" }),
	internalRole: z.string().optional(),
	area: z.enum(UserAreasValuesArray).optional().nullable(),
	modules: z.array(z.enum(ModulesValuesArray)).optional(),
})

export type InternalUserSchema = z.infer<typeof internalUserSchema>
