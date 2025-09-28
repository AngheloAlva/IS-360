"use server"

import { resend } from "@/lib/resend"

import { RequestReviewEmail } from "@/project/labor-control/components/emails/RequestReviewEmail"

interface SendRequestReviewEmailProps {
	reviewUrl: string
	folderName: string
	companyName: string
	solicitationDate: Date
	solicitator: {
		rut: string
		name: string
		email: string
		phone: string | null
	}
}

export const sendRequestReviewEmail = async ({
	reviewUrl,
	folderName,
	solicitator,
	companyName,
	solicitationDate,
}: SendRequestReviewEmailProps) => {
	try {
		const emailNotification = [
			"cristian.pavez@oleotrasandino.cl",
			"katherine.burgos@oleotrasandino.cl",
		]

		const { data, error } = await resend.emails.send({
			from: "anghelo.alva@ingenieriasimple.cl",
			to: emailNotification,
			bcc: ["soporte@ingenieriasimple.cl"],
			subject: `Solicitud de Revisión Control Laboral - ${folderName} - ${companyName}`,
			react: await RequestReviewEmail({
				reviewUrl,
				folderName,
				solicitator,
				companyName,
				solicitationDate,
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
