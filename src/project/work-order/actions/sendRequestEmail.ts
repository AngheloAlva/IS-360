interface SendRequestClosureEmailProps {
	email: string
	workOrderId: string
	companyName: string
	workOrderName: string
	supervisorName: string
	workOrderNumber: string
}

export const sendRequestClosureEmail = async (
	props: SendRequestClosureEmailProps
) => {
	console.info("[demo] email noop: sendRequestClosureEmail", props)
	return { ok: true, data: null as unknown }
}
