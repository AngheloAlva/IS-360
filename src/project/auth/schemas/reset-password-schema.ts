import { z } from "zod"

export const resetPasswordSchema = z.object({
	password: z
		.string()
		.nonempty({ message: "La contraseña no puede estar vacía" })
		.min(8, { message: "La contraseña debe tener al menos 8 caracteres" })
		.regex(/[A-Z]/, { message: "La contraseña debe tener al menos una mayúscula" })
		.regex(/[a-z]/, { message: "La contraseña debe tener al menos una minúscula" })
		.regex(/[0-9]/, { message: "La contraseña debe tener al menos un número" })
		.regex(/[^A-Za-z0-9]/, { message: "La contraseña debe tener al menos un carácter especial" }),
})

export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>
