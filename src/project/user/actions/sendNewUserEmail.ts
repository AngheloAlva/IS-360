"use server"

import { NewUserEmail } from "@/project/user/components/emails/NewUserEmail"
import { resend } from "@/lib/resend"

interface SendNewUserEmailProps {
	name: string
	email: string
	password: string
}

export const sendNewUserEmail = async ({ email, name, password }: SendNewUserEmailProps) => {
	try {
		const { data, error } = await resend.emails.send({
			from: "anghelo.alva@ingenieriasimple.cl",
			to: [email],
			subject: `Bienvenido a OTC 360`,
			react: await NewUserEmail({
				name,
				email,
				password,
			}),
		})

		if (error) {
			console.error("[SEND_NEW_USER_EMAIL]", error)
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
		console.error("[SEND_NEW_USER_EMAIL]", error)
		return {
			ok: false,
			error,
		}
	}
}
