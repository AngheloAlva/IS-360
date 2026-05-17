interface SendVisitorTalkInviteEmailProps {
	companyName: string
	visitorEmail: string
	accessToken: string
	expiresAt: Date
}

export const sendVisitorTalkInviteEmail = async (props: SendVisitorTalkInviteEmailProps) => {
	console.info("[demo] email noop: sendVisitorTalkInviteEmail", props)
	return { ok: true, data: null as unknown }
}
