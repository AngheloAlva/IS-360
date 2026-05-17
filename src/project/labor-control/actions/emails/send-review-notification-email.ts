interface SendReviewNotificationEmailProps {
	folderName: string
	companyName: string
	reviewDate: Date
	reviewer: {
		name: string
		email: string
		phone: string | null
	}
	isApproved: boolean
	rejectedDocuments?: Array<{
		name: string
		reason: string
	}>
	emails: string[]
}

export const sendReviewNotificationEmail = async (
	props: SendReviewNotificationEmailProps,
) => {
	console.info("[demo] email noop: sendReviewNotificationEmail", props)
	return { ok: true, data: null as unknown }
}
