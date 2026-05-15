"use server"

import { systemUrl } from "@/lib/consts/systemUrl"
import { resend } from "@/lib/resend"
import { SupportTicketStatusEmail } from "@/project/support/components/emails/SupportTicketResolvedEmail"

interface SendSupportTicketStatusEmailProps {
	name: string
	email: string
	ticketNumber: string
	title: string
	statusLabel: string
	note?: string
	accessRole: "ADMIN" | "PARTNER_COMPANY"
}

export async function sendSupportTicketStatusEmail({
	name,
	email,
	ticketNumber,
	title,
	statusLabel,
	note,
	accessRole,
}: SendSupportTicketStatusEmailProps) {
	try {
		const url =
			accessRole === "ADMIN"
				? `${systemUrl}/admin/dashboard/soporte`
				: `${systemUrl}/dashboard/soporte`

		const { error } = await resend.emails.send({
			from: "sistema@is360.cl",
			to: [email],
			bcc: ["anghelo.alva@ingsimple.cl"],
			subject: `Actualizacion ticket ${ticketNumber}`,
			react: await SupportTicketStatusEmail({
				name,
				ticketNumber,
				title,
				statusLabel,
				note,
				url,
			}),
		})

		if (error) {
			console.error("[SEND_SUPPORT_TICKET_STATUS_EMAIL]", error)
			return {
				ok: false,
				error,
			}
		}

		return {
			ok: true,
		}
	} catch (error) {
		console.error("[SEND_SUPPORT_TICKET_STATUS_EMAIL]", error)
		return {
			ok: false,
			error,
		}
	}
}
