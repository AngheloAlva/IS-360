interface SendUrgentWorkPermitEmailProps {
	applicantName: string
	companyName: string
	exactPlace: string
	workWillBe: string
	activityDetails: string[]
	startDate: Date
	endDate: Date
	participants: string[]
	otNumber?: string
	additionalObservations?: string
}

export const sendUrgentWorkPermitEmail = async (
	_props: SendUrgentWorkPermitEmailProps,
) => {
	console.log("[demo] sendUrgentWorkPermitEmail noop")
	return { ok: true }
}
