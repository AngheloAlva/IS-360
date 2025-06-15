"use server"

import { resend } from "@/lib/resend"

import { NewUserEmail } from "@/project/user/components/emails/NewUserEmail"

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
