interface SendCloseWorkBookEmailProps {
	email: string
	otNumber: string
	companyName: string
	workOrderName: string
	closureReason: string
	supervisorName: string
	workOrderNumber: string
}

export const sendCloseWorkBookEmail = async (
	props: SendCloseWorkBookEmailProps
) => {
	console.info("[demo] email noop: sendCloseWorkBookEmail", props)
	return { ok: true, data: null as unknown }
}
