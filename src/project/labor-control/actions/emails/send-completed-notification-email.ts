"use server"

import { resend } from "@/lib/resend"

import { CompleteFolderEmail } from "@/project/labor-control/components/emails/CompleteFolderEmail"

interface SendCompletedNotificationEmailProps {
	emails: string[]
	folderName: string
	companyName: string
	completedBy: {
		name: string
		email: string
		phone: string | null
	}
	completeDate: Date
}

export const sendCompletedNotificationEmail = async ({
	emails,
	folderName,
	companyName,
	completedBy,
	completeDate,
}: SendCompletedNotificationEmailProps) => {
	try {
		const { data, error } = await resend.emails.send({
			from: "anghelo.alva@ingenieriasimple.cl",
			to: emails,
			subject: `Control Laboral Completado - ${folderName}`,
			react: await CompleteFolderEmail({
				folderName,
				companyName,
				completedBy,
				completeDate,
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
