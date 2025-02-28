import { z } from "zod"

export const loginSchema = z.object({
	email: z.string().email({ message: "El email no es válido" }),
	password: z.string().nonempty({ message: "La contraseña no puede estar vacía" }),
})
