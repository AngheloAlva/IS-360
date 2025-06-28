"use server"

import { resend } from "@/lib/resend"

import { RequestReviewEmail } from "@/project/startup-folder/components/emails/RequestReviewEmail"

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
					"cristian.pavez@oleotrasandino.cl",
					"katherine.burgos@oleotrasandino.cl",
					"soporte@ingenieriasimple.cl",
				]
				break
			case DocumentCategory.ENVIRONMENTAL:
				emailNotification = [
					"anghelo.alva@ingsimple.cl",
					"bcarrillo@dbj.cl",
					"katherine.burgos@oleotrasandino.cl",
					"soporte@ingenieriasimple.cl",
				]
				break
			case DocumentCategory.PERSONNEL:
				emailNotification = [
					"anghelo.alva@ingsimple.cl",
					"cristian.pavez@oleotrasandino.cl",
					"katherine.burgos@oleotrasandino.cl",
					"soporte@ingenieriasimple.cl",
				]
				break
			case DocumentCategory.VEHICLES:
				emailNotification = [
					"anghelo.alva@ingsimple.cl",
					"cristian.pavez@oleotrasandino.cl",
					"katherine.burgos@oleotrasandino.cl",
					"soporte@ingenieriasimple.cl",
				]
				break
			case DocumentCategory.BASIC:
				emailNotification = [
					"anghelo.alva@ingsimple.cl",
					"katherine.burgos@oleotrasandino.cl",
					"soporte@ingenieriasimple.cl",
				]
		}

		const { data, error } = await resend.emails.send({
			from: "anghelo.alva@ingenieriasimple.cl",
			to: emailNotification,
			subject: `Solicitud de Revisión Carpetas de arranque - ${companyName} - ${folderName}`,
			react: await RequestReviewEmail({
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
