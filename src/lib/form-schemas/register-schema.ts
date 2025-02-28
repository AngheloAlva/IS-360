import { z } from "zod"

const rutRegex = /^\d{1,2}\.\d{3}\.\d{3}-[0-9kK]$/

export const registerSchema = z.object({
	name: z.string().min(2, { message: "El nombre de la empresa debe tener al menos 2 caracteres" }),
	email: z.string().email({ message: "El email no es válido" }),
	password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
	rut: z.string().regex(rutRegex, { message: "El RUT no es válido" }),
})
