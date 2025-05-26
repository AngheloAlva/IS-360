"use server"

import { resend } from "@/lib/resend"

import { RequestReviewEmailTemplate } from "@/components/emails/startup-folders/RequestReviewEmailTemplate"

interface SendApproveClosureEmailProps {
	folderName: string
	companyName: string
}

export const sendRequestReviewEmail = async ({
	folderName,
	companyName,
}: SendApproveClosureEmailProps) => {
	try {
		const { data, error } = await resend.emails.send({
			from: "anghelo.alva@ingenieriasimple.cl",
			to: ["anghelo.alva@ingenieriasimple.cl"],
			subject: `Solicitud de Revisión Carpetas de arranque - ${companyName} - ${folderName}`,
			react: await RequestReviewEmailTemplate({
				folderName,
				companyName,
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
