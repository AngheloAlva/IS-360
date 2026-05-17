interface SendCompletedNotificationEmailProps {
	emails: string[]
	folderName: string
	companyName: string
	completedBy: {
		name: string
		email: string
		phone: string | null
	}
	completeDate: Date
}

export const sendCompletedNotificationEmail = async (
	props: SendCompletedNotificationEmailProps,
) => {
	console.info("[demo] email noop: sendCompletedNotificationEmail", props)
	return { ok: true, data: null as unknown }
}
