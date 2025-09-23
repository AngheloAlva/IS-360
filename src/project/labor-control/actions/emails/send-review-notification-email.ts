"use server"

import { resend } from "@/lib/resend"

import { ReviewEmail } from "@/project/startup-folder/components/emails/ReviewEmail"

interface SendReviewNotificationEmailProps {
	emails: string[]
	folderName: string
	companyName: string
	reviewDate: Date
	reviewer: {
		name: string
		email: string
		phone: string | null
	}
	isApproved: boolean
	rejectedDocuments?: Array<{
		name: string
		reason: string
	}>
}

export const sendReviewNotificationEmail = async ({
	emails,
	reviewer,
	reviewDate,
	folderName,
	isApproved,
	companyName,
	rejectedDocuments,
}: SendReviewNotificationEmailProps) => {
	try {
		const { data, error } = await resend.emails.send({
			from: "anghelo.alva@ingenieriasimple.cl",
			to: emails,
			subject: `Revisión de Carpetas de arranque - ${folderName}`,
			react: await ReviewEmail({
				reviewer,
				folderName,
				companyName,
				reviewDate,
				isApproved,
				rejectedDocuments,
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
