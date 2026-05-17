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
	console.info("[demo] email noop: sendNewSupportTicketEmail", payload)
	return { ok: true }
}
