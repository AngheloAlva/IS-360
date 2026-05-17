interface SendSupportTicketStatusEmailProps {
	name: string
	email: string
	ticketNumber: string
	title: string
	statusLabel: string
	note?: string
	accessRole: "ADMIN" | "PARTNER_COMPANY"
}

export async function sendSupportTicketStatusEmail(payload: SendSupportTicketStatusEmailProps) {
	console.info("[demo] email noop: sendSupportTicketStatusEmail", payload)
	return { ok: true }
}
