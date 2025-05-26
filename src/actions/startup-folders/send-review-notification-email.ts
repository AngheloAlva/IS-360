"use server"

import { resend } from "@/lib/resend"

import { ReviewEmailTemplate } from "@/components/emails/startup-folders/ReviewEmailTemplate"

interface SendReviewNotificationEmailProps {
	emails: string[]
	folderName: string
	companyName: string
}

export const sendReviewNotificationEmail = async ({
	emails,
	folderName,
	companyName,
}: SendReviewNotificationEmailProps) => {
	try {
		const { data, error } = await resend.emails.send({
			from: "anghelo.alva@ingenieriasimple.cl",
			to: emails,
			subject: `Revisión de Carpetas de arranque - ${folderName}`,
			react: await ReviewEmailTemplate({
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
