import { z } from "zod"

export const otpSchema = z.object({
	otpCode: z.string().min(6, {
		message: "El codigo de verificacion debe tener 6 caracteres.",
	}),
	trustDevice: z.boolean().optional(),
})

export type OtpSchema = z.infer<typeof otpSchema>
