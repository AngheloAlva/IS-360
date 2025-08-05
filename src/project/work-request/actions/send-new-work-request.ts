"use server"

import { Resend } from "resend"

import { NewWorkRequestEmail } from "@/project/work-request/components/emails/NewWorkRequest"

const resend = new Resend(process.env.RESEND_API_KEY)

interface SendNewWorkRequestEmailProps {
	baseUrl: string
	userName: string
	isUrgent: boolean
	requestDate: Date
	description: string
	requestNumber: string
	equipmentName?: string[]
	observations?: string | null
}

export async function sendNewWorkRequestEmail({
	baseUrl,
	userName,
	isUrgent,
	requestDate,
	description,
	observations,
	equipmentName,
	requestNumber,
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
			from: "anghelo.alva@ingenieriasimple.cl",
			to: [
				"anghelo.alva@ingenieriasimple.cl",
				"gsereno@oleotrasandino.cl",
				"katherine.burgos@oleotrasandino.cl",
				"jaime.chavez@oleotrasandino.cl",
				"gonzalo.orellana@oleotrasandino.cl",
				"soporte@ingenieriasimple.cl",
				"jculloa@oleotrasandino.cl",
			],
			subject,
			react: NewWorkRequestEmail({
				baseUrl,
				userName,
				isUrgent,
				requestDate,
				description,
				observations,
				equipmentName,
				requestNumber,
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
