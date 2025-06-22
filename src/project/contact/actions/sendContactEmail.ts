"use server"

import { Resend } from "resend"
import { logActivity } from "@/lib/activity/log"
import { ACTIVITY_TYPE, MODULES } from "@prisma/client"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"

import { SupportEmail } from "@/project/contact/components/emails/SupportEmail"

const resend = new Resend(process.env.RESEND_API_KEY)

interface SendContactEmailProps {
	message: string
	filesUrls: string[]
	type: "support" | "contact"
}

export const sendContactEmail = async ({ message, filesUrls, type }: SendContactEmailProps) => {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return {
			ok: false,
			error: "No autorizado",
		}
	}

	try {
		const { data, error } = await resend.emails.send({
			from: "anghelo.alva@ingenieriasimple.cl",
			to: ["anghelo.alva@ingsimple.cl"],
			subject: `Nuevo mensaje de ${type === "support" ? "soporte" : "contacto"}`,
			react: await SupportEmail({
				type,
				message,
				filesUrls,
			}),
		})

		if (error || !data?.id) {
			return {
				ok: false,
				error: error || "No se pudo enviar el correo",
			}
		}

		logActivity({
			userId: session.user.id,
			module: MODULES.CONTACT,
			action: ACTIVITY_TYPE.CREATE,
			entityId: data.id,
			entityType: "Email",
			metadata: {
				type,
				message,
				filesUrls,
				to: "anghelo.alva@ingsimple.cl",
				from: "anghelo.alva@ingenieriasimple.cl",
			},
		})

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
