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

export async function sendSupportTicketNoteEmail(payload: SendSupportTicketNoteEmailProps) {
	console.info("[demo] email noop: sendSupportTicketNoteEmail", payload)
	return { ok: true }
}
