import { z } from "zod"

export const changePasswordSchema = z.object({
	currentPassword: z.string().nonempty({ message: "La contraseña es obligatoria" }),
	newPassword: z
		.string()
		.min(8, { message: "La contraseña debe tener al menos 8 caracteres" })
		.regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]{8,}$/, {
			message:
				"La contraseña debe contener al menos 8 caracteres, una mayúscula, un número y un carácter especial",
		}),
})

export type ChangePasswordSchema = z.infer<typeof changePasswordSchema>
