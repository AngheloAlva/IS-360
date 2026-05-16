interface SendRequestCloseMilestoneEmailProps {
	responsibleEmail: string
	milestone: {
		name: string
		weight: number
		description: string | null
		workOrderId: string
		workOrder: {
			otNumber: string
			workBookName: string | null
			workDescription: string | null
		}
	}
}

export const sendRequestCloseMilestoneEmail = async (
	props: SendRequestCloseMilestoneEmailProps
) => {
	console.info("[demo] email noop: sendRequestCloseMilestoneEmail", props)
	return { ok: true, data: null as unknown }
}

interface SendApproveMilestoneEmailProps {
	comment?: string
	otNumber: string
	supervisorEmail: string
	milestoneName: string
}

export const sendApproveMilestoneEmail = async (
	props: SendApproveMilestoneEmailProps
) => {
	console.info("[demo] email noop: sendApproveMilestoneEmail", props)
	return { ok: true, data: null as unknown }
}

interface SendRejectMilestoneEmailProps {
	comment?: string
	otNumber: string
	milestoneName: string
	supervisorEmail: string
}

export const sendRejectMilestoneEmail = async (
	props: SendRejectMilestoneEmailProps
) => {
	console.info("[demo] email noop: sendRejectMilestoneEmail", props)
	return { ok: true, data: null as unknown }
}
