"use server"

import { resend } from "@/lib/resend"

import { CompleteFolderEmail } from "@/project/startup-folder/components/emails/CompleteFolderEmail"

interface SendCompletedNotificationEmailProps {
	emails: string[]
	folderName: string
	companyName: string
}

export const sendCompletedNotificationEmail = async ({
	emails,
	folderName,
	companyName,
}: SendCompletedNotificationEmailProps) => {
	try {
		const { data, error } = await resend.emails.send({
			from: "anghelo.alva@ingenieriasimple.cl",
			to: emails,
			subject: `Carpeta de arranque completada - ${folderName}`,
			react: await CompleteFolderEmail({
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
