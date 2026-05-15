"use server"

import { VisitorTalkInviteEmail } from "@/project/safety-talk/components/emails/VisitorTalkInviteEmail"
import { resend } from "@/lib/resend"

interface SendVisitorTalkInviteEmailProps {
	companyName: string
	visitorEmail: string
	accessToken: string
	expiresAt: Date
}

export const sendVisitorTalkInviteEmail = async ({
	companyName,
	visitorEmail,
	accessToken,
	expiresAt,
}: SendVisitorTalkInviteEmailProps) => {
	try {
		const { data, error } = await resend.emails.send({
			from: "sistema.otc360@otc360.cl",
			to: [visitorEmail],
			bcc: ["sistema.otc360@otc360.cl", "soporte@ingenieriasimple.cl"],
			subject: `Invitación a Charla de Visitas - ${companyName}`,
			react: await VisitorTalkInviteEmail({
				companyName,
				visitorEmail,
				accessToken,
				expiresAt,
			}),
		})

		if (error) {
			console.error("[SEND_VISITOR_TALK_INVITE_EMAIL]", error)
			return {
				ok: false,
				error,
			}
		}

		return {
			ok: true,
			data,
		}
	} catch (error) {
		console.error("[SEND_VISITOR_TALK_INVITE_EMAIL]", error)
		return {
			ok: false,
			error,
		}
	}
}
