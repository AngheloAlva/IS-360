"use server"

import { Resend } from "resend"

import { NewWorkRequestEmail } from "@/project/work-request/components/emails/NewWorkRequest"

const resend = new Resend(process.env.RESEND_API_KEY)

interface SendNewWorkRequestEmailProps {
	userName: string
	isUrgent: boolean
	requestDate: Date
	description: string
	requestNumber: string
	equipmentName?: string
	observations?: string | null
}

export async function sendNewWorkRequestEmail({
	userName,
	requestNumber,
	isUrgent,
	requestDate,
	description,
	equipmentName,
	observations,
}: SendNewWorkRequestEmailProps) {
	if (!process.env.RESEND_API_KEY) {
		console.error("Resend API key not found")
		return {
			error: "Resend API key not found",
		}
	}

	try {
		const subject = `Nueva Solicitud de Trabajo ${isUrgent ? "URGENTE" : ""} #${requestNumber}`

		await resend.emails.send({
			from: "OTC Notificaciones <noreply@otc-notificaciones.cl>",
			to: [
				"gsereno@oleotrasandino.cl",
				"anghelo.alva@ingsimple.cl",
				"katherine.burgos@oleotrasandino.cl",
				"jaime.chavez@oleotrasandino.cl",
				"jculloa@oleotrasandino.cl",
				"soporte@ingenieriasimple.cl",
			],
			subject,
			react: NewWorkRequestEmail({
				userName,
				isUrgent,
				requestDate,
				description,
				observations,
				equipmentName,
				requestNumber,
				baseUrl: "https://otc360.ingsimple.cl",
			}),
		})

		return {
			success: "Correo enviado correctamente",
		}
	} catch (error) {
		console.error("Error al enviar correo:", error)
		return {
			error: "Error al enviar correo",
		}
	}
}
