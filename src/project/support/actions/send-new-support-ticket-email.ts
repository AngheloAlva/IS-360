"use server"

import { resend } from "@/lib/resend"
import { NewSupportTicketEmail } from "@/project/support/components/emails/NewSupportTicketEmail"

interface SendNewSupportTicketEmailProps {
	ticketNumber: string
	title: string
	requesterName: string
	requesterEmail: string
	companyName?: string | null
	priority: string
	type: string
	affectedModule?: string | null
	description: string
}

export async function sendNewSupportTicketEmail(payload: SendNewSupportTicketEmailProps) {
	try {
		const { error } = await resend.emails.send({
			from: "sistema@is360.cl",
			to: ["anghelo.alva@ingsimple.cl", "soporte@ingenieriasimple.cl"],
			subject: `Nuevo ticket de soporte ${payload.ticketNumber}`,
			react: await NewSupportTicketEmail(payload),
		})

		if (error) {
			console.error("[SEND_NEW_SUPPORT_TICKET_EMAIL]", error)
			return {
				ok: false,
				error,
			}
		}

		return {
			ok: true,
		}
	} catch (error) {
		console.error("[SEND_NEW_SUPPORT_TICKET_EMAIL]", error)
		return {
			ok: false,
			error,
		}
	}
}
