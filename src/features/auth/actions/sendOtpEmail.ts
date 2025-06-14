"use server"

import { Resend } from "resend"

import { OTPCodeEmail } from "@/features/auth/components/emails/OTPCodeEmail"

const resend = new Resend(process.env.RESEND_API_KEY)

interface SendOtpEmailProps {
	email: string
	otp: string
}

export const sendOtpEmail = async ({ email, otp }: SendOtpEmailProps) => {
	try {
		const { data, error } = await resend.emails.send({
			from: "anghelo.alva@ingenieriasimple.cl",
			to: [email],
			subject: `Código de verificación para OTC 360`,
			react: await OTPCodeEmail({
				otp,
			}),
		})

		if (error) {
			return {
				ok: false,
				error,
			}
		}

		return {
			ok: true,
			data,
		}
	} catch (error) {
		return {
			ok: false,
			error,
		}
	}
}
