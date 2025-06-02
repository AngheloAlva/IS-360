"use server"

import { Resend } from "resend"

import { SupportEmailTemplate } from "@/components/emails/contact/SupportEmailTemplate"

const resend = new Resend(process.env.RESEND_API_KEY)

interface SendContactEmailProps {
	message: string
	filesUrls: string[]
	type: "support" | "contact"
}

export const sendContactEmail = async ({ message, filesUrls, type }: SendContactEmailProps) => {
	try {
		const { data, error } = await resend.emails.send({
			from: "anghelo.alva@ingenieriasimple.cl",
			to: ["anghelo.alva@ingsimple.cl"],
			subject: `Nuevo mensaje de ${type === "support" ? "soporte" : "contacto"}`,
			react: await SupportEmailTemplate({
				type,
				message,
				filesUrls,
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
