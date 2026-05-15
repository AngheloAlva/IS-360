"use server"

import { Resend } from "resend"

import { WorkRequestNewCommentEmail } from "@/project/work-request/components/emails/work-request-new-comment-email"

const resend = new Resend(process.env.RESEND_API_KEY)

interface SendWorkRequestCommentNotificationProps {
	userEmail: string
	userName: string
	commenterName: string
	requestNumber: string
	description: string
	commentContent: string
}

export async function sendWorkRequestCommentNotification({
	userEmail,
	userName,
	commenterName,
	requestNumber,
	description,
	commentContent,
}: SendWorkRequestCommentNotificationProps) {
	if (!process.env.RESEND_API_KEY) {
		console.error("Resend API key not found")
		return {
			error: "Resend API key not found",
		}
	}

	try {
		const subject = `Nuevo comentario en Solicitud de Trabajo #${requestNumber}`

		await resend.emails.send({
			from: "Notificaciones Internas <sistema@is360.cl>",
			to: userEmail,
			subject,
			react: WorkRequestNewCommentEmail({
				userName,
				commenterName,
				requestNumber,
				description,
				commentContent,
			}),
		})

		return {
			success: "Correo enviado correctamente",
		}
	} catch (error) {
		console.error("Error al enviar correo de comentario:", error)
		return {
			error: "Error al enviar correo",
		}
	}
}
