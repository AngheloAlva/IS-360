interface SendNewUserEmailProps {
	name: string
	email: string
	password: string
}

export const sendNewUserEmail = async (props: SendNewUserEmailProps) => {
	console.info("[demo] email noop: sendNewUserEmail", props)
	return { ok: true, data: null as unknown }
}
