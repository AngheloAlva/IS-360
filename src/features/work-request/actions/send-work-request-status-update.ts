"use server"

import { Resend } from "resend"

import { WorkRequestStatusUpdateEmail } from "@/features/work-request/components/emails/work-request-status-update-email"
import { WORK_REQUEST_STATUS } from "@prisma/client"

const resend = new Resend(process.env.RESEND_API_KEY)

interface SendWorkRequestStatusUpdateEmailProps {
	userEmail: string
	userName: string
	requestNumber: string
	status: WORK_REQUEST_STATUS
	description: string
}

export async function sendWorkRequestStatusUpdateEmail({
	userEmail,
	userName,
	requestNumber,
	status,
	description,
}: SendWorkRequestStatusUpdateEmailProps) {
	if (!process.env.RESEND_API_KEY) {
		console.error("Resend API key not found")
		return {
			error: "Resend API key not found",
		}
	}

	try {
		const statusText = {
			[WORK_REQUEST_STATUS.REPORTED]: "Reportada",
			[WORK_REQUEST_STATUS.ATTENDED]: "Atendida",
			[WORK_REQUEST_STATUS.CANCELLED]: "Cancelada",
		}

		const subject = `Actualización de estado - Solicitud de Trabajo #${requestNumber}`

		await resend.emails.send({
			from: "OTC Notificaciones <noreply@otc-notificaciones.cl>",
			to: userEmail,
			subject,
			react: WorkRequestStatusUpdateEmail({
				userName,
				requestNumber,
				status: statusText[status],
				description,
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
