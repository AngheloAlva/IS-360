import type { WORK_REQUEST_STATUS } from "@/generated/prisma/enums"

interface SendWorkRequestStatusUpdateEmailProps {
	userEmail: string
	userName: string
	requestNumber: string
	status: WORK_REQUEST_STATUS
	description: string
}

export async function sendWorkRequestStatusUpdateEmail(
	_props: SendWorkRequestStatusUpdateEmailProps,
) {
	console.log("[demo] sendWorkRequestStatusUpdateEmail noop")
	return { ok: true }
}
