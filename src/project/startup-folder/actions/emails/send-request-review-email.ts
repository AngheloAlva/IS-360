"use server"

import { resend } from "@/lib/resend"

import { DocumentCategory } from "@/generated/prisma/enums"
import { getReviewRequestRecipients } from "./review-email-recipients"

import { RequestReviewEmail } from "@/project/startup-folder/components/emails/RequestReviewEmail"

interface SendRequestReviewEmailProps {
	reviewUrl: string
	folderName: string
	companyName: string
	solicitationDate: Date
	documentCategory: DocumentCategory
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
	documentCategory,
}: SendRequestReviewEmailProps) => {
	try {
		const emailNotification = getReviewRequestRecipients(documentCategory)

		const { data, error } = await resend.emails.send({
			from: "sistema.otc360@otc360.cl",
			to: emailNotification,
			bcc: ["soporte@ingenieriasimple.cl"],
			subject: `Solicitud de Revisión ${folderName} - ${companyName}`,
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
