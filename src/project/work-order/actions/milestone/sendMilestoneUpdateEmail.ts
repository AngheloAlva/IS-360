interface SendMilestoneUpdateEmailProps {
	email: string
	updateDate?: Date
	workOrderId: string
	companyName: string
	workOrderName: string
	supervisorName: string
	workOrderNumber: string
	milestonesCount: number
}

export const sendMilestoneUpdateEmail = async (
	props: SendMilestoneUpdateEmailProps
) => {
	console.info("[demo] email noop: sendMilestoneUpdateEmail", props)
	return { ok: true, data: null as unknown }
}
