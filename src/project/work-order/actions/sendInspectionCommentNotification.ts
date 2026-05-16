interface SendInspectionCommentNotificationProps {
	commentId: string
	workEntryId: string
}

export const sendInspectionCommentNotification = async (
	props: SendInspectionCommentNotificationProps
) => {
	console.info("[demo] email noop: sendInspectionCommentNotification", props)
	return { ok: true }
}
