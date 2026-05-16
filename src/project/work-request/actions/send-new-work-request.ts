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

export async function sendNewWorkRequestEmail(_props: SendNewWorkRequestEmailProps) {
	console.log("[demo] sendNewWorkRequestEmail noop")
	return { ok: true }
}
