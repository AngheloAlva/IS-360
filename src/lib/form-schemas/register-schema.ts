import { z } from "zod"

import { rutRegex } from "./rutRegex"

export const registerSchema = z.object({
	name: z.string().min(2, { message: "El nombre de la empresa debe tener al menos 2 caracteres" }),
	email: z.string().email({ message: "El email no es válido" }),
	rut: z.string().regex(rutRegex, { message: "El RUT no es válido" }),
	password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
})
