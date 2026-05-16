interface SendInternalInspectionNotificationProps {
	workEntryId: string
}

export const sendInternalInspectionNotification = async (
	props: SendInternalInspectionNotificationProps
) => {
	console.info("[demo] email noop: sendInternalInspectionNotification", props)
	return {
		ok: true,
		message: "Notificaciones (demo) enviadas",
		sent: 0,
		failed: 0,
	}
}
