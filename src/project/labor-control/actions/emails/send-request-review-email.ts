interface SendRequestReviewEmailProps {
	reviewUrl: string
	folderName: string
	companyName: string
	solicitationDate: Date
	solicitator: {
		rut: string
		name: string
		email: string
		phone: string | null
	}
}

export const sendRequestReviewEmail = async (props: SendRequestReviewEmailProps) => {
	console.info("[demo] email noop: sendRequestReviewEmail", props)
	return { ok: true, data: null as unknown }
}
