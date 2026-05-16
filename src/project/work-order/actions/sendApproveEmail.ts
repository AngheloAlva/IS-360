interface SendApproveClosureEmailProps {
	workOrderName: string
	workOrderNumber: string
	companyName: string
	supervisorName: string
	email: string
	autoClosed?: boolean
	milestoneName?: string
	milestoneComment?: string
}

export const sendApproveClosureEmail = async (
	props: SendApproveClosureEmailProps
) => {
	console.info("[demo] email noop: sendApproveClosureEmail", props)
	return { ok: true, data: null as unknown }
}
