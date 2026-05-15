"use server"

import { systemUrl } from "@/lib/consts/systemUrl"
import { resend } from "@/lib/resend"
import { SupportTicketNoteEmail } from "@/project/support/components/emails/SupportTicketNoteEmail"

interface SendSupportTicketNoteEmailProps {
	to: string[]
	recipientName: string
	commenterName: string
	ticketNumber: string
	title: string
	noteContent: string
	hasAttachments: boolean
	accessRole: "ADMIN" | "PARTNER_COMPANY"
}

export async function sendSupportTicketNoteEmail({
	to,
	recipientName,
	commenterName,
	ticketNumber,
	title,
	noteContent,
	hasAttachments,
	accessRole,
}: SendSupportTicketNoteEmailProps) {
	try {
		const url =
			accessRole === "ADMIN"
				? `${systemUrl}/admin/dashboard/soporte`
				: `${systemUrl}/dashboard/soporte`

		const { error } = await resend.emails.send({
			from: "sistema@is360.cl",
			to,
			bcc: ["anghelo.alva@ingsimple.cl"],
			subject: `Nueva observacion en ticket ${ticketNumber}`,
			react: await SupportTicketNoteEmail({
				recipientName,
				commenterName,
				ticketNumber,
				title,
				noteContent,
				hasAttachments,
				url,
			}),
		})

		if (error) {
			console.error("[SEND_SUPPORT_TICKET_NOTE_EMAIL]", error)
			return { ok: false, error }
		}

		return { ok: true }
	} catch (error) {
		console.error("[SEND_SUPPORT_TICKET_NOTE_EMAIL]", error)
		return { ok: false, error }
	}
}
