interface SendRejectClosureEmailProps {
	email: string
	companyName: string
	workOrderName: string
	supervisorName: string
	workOrderNumber: string
	rejectionReason?: string
}

export const sendRejectClosureEmail = async (
	props: SendRejectClosureEmailProps
) => {
	console.info("[demo] email noop: sendRejectClosureEmail", props)
	return { ok: true, data: null as unknown }
}
