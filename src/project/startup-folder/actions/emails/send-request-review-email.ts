"use server"

import { resend } from "@/lib/resend"

import { DocumentCategory } from "@prisma/client"

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
		let emailNotification: string[]

		switch (documentCategory) {
			case DocumentCategory.SAFETY_AND_HEALTH:
				emailNotification = [
					"cristian.pavez@oleotrasandino.cl",
					"katherine.burgos@oleotrasandino.cl",
				]
				break
			case DocumentCategory.ENVIRONMENTAL:
				emailNotification = ["bcarrillo@dbj.cl", "katherine.burgos@oleotrasandino.cl"]
				break
			case DocumentCategory.ENVIRONMENT:
				emailNotification = ["bcarrillo@dbj.cl", "katherine.burgos@oleotrasandino.cl"]
				break
			case DocumentCategory.TECHNICAL_SPECS:
				emailNotification = ["jaime.chavez@oleotrasandino.cl"]
				break
			case DocumentCategory.PERSONNEL:
				emailNotification = [
					"cristian.pavez@oleotrasandino.cl",
					"katherine.burgos@oleotrasandino.cl",
				]
				break
			case DocumentCategory.VEHICLES:
				emailNotification = [
					"cristian.pavez@oleotrasandino.cl",
					"katherine.burgos@oleotrasandino.cl",
				]
				break
			case DocumentCategory.BASIC:
				emailNotification = ["katherine.burgos@oleotrasandino.cl"]
		}

		const { data, error } = await resend.emails.send({
			from: "anghelo.alva@ingenieriasimple.cl",
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
