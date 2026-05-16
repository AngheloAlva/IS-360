interface SendWorkRequestCommentNotificationProps {
	userEmail: string
	userName: string
	commenterName: string
	requestNumber: string
	description: string
	commentContent: string
}

export async function sendWorkRequestCommentNotification(
	_props: SendWorkRequestCommentNotificationProps,
) {
	console.log("[demo] sendWorkRequestCommentNotification noop")
	return { ok: true }
}
