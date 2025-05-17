"use server"

import { resend } from "@/lib/resend"

import { NewUserEmailTemplate } from "@/components/emails/NewUserEmailTemplate"

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
			react: await NewUserEmailTemplate({
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
