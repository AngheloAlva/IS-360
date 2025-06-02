"use server"

import { resend } from "@/lib/resend"

import { RequestReviewEmailTemplate } from "@/components/emails/startup-folders/RequestReviewEmailTemplate"

import { DocumentCategory } from "@prisma/client"

interface SendRequestReviewEmailProps {
	folderName: string
	companyName: string
	documentCategory: DocumentCategory
	solicitator: {
		rut: string
		name: string
		email: string
		phone: string | null
	}
}

export const sendRequestReviewEmail = async ({
	solicitator,
	folderName,
	companyName,
	documentCategory,
}: SendRequestReviewEmailProps) => {
	try {
		let emailNotification: string[]

		switch (documentCategory) {
			case DocumentCategory.SAFETY_AND_HEALTH:
				emailNotification = [
					"anghelo.alva@ingsimple.cl",
					// "cristian.pavez@oleotrasandino.cl",
					// "katherine.burgos@oleotrasandino.cl",
				]
				break
			case DocumentCategory.ENVIRONMENTAL:
				emailNotification = [
					"anghelo.alva@ingsimple.cl",
					// "bcarrillo@dbj.cl",
					// "katherine.burgos@oleotrasandino.cl",
				]
				break
			case DocumentCategory.PERSONNEL:
				emailNotification = [
					// "cristian.pavez@oleotrasandino.cl",
					"anghelo.alva@ingsimple.cl",
					// "katherine.burgos@oleotrasandino.cl",
				]
				break
			case DocumentCategory.VEHICLES:
				emailNotification = [
					// "cristian.pavez@oleotrasandino.cl",
					"anghelo.alva@ingsimple.cl",
					// "katherine.burgos@oleotrasandino.cl",
				]
				break
		}

		const { data, error } = await resend.emails.send({
			from: "anghelo.alva@ingenieriasimple.cl",
			to: emailNotification,
			subject: `Solicitud de Revisión Carpetas de arranque - ${companyName} - ${folderName}`,
			react: await RequestReviewEmailTemplate({
				folderName,
				companyName,
				solicitator,
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
