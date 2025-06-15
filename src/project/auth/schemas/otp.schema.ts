import { z } from "zod"

export const otpSchema = z.object({
	otpCode: z.string().min(6, {
		message: "Your one-time password must be 6 characters.",
	}),
})

export type OtpSchema = z.infer<typeof otpSchema>
