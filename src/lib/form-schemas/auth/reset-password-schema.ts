import { z } from "zod"

export const resetPasswordSchema = z.object({
	password: z.string().nonempty({ message: "La nueva contraseña no puede estar vacía" }),
})

export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>
