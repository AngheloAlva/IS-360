import { getDemoDb } from "@/lib/demo-db/client"
import { sendVisitorTalkInviteEmail } from "@/project/safety-talk/actions/sendVisitorTalkInviteEmail"

interface ResendVisitorTalkInvitesProps {
	visitorTalkId: string
	emails?: string[]
}

export async function resendVisitorTalkInvites({
	visitorTalkId,
	emails,
}: ResendVisitorTalkInvitesProps) {
	try {
		const db = await getDemoDb()
		const res = await db.query<{
			id: string
			uniqueToken: string
			isActive: boolean
			expiresAt: string | null
			companyId: string
			companyName: string | null
			companyEmails: string[] | null
		}>(
			`SELECT vt.id, vt."uniqueToken", vt."isActive", vt."expiresAt",
				vt."companyId", ec.name AS "companyName", ec.emails AS "companyEmails"
			 FROM "visitor_talk" vt
			 LEFT JOIN "external_company" ec ON ec.id = vt."companyId"
			 WHERE vt.id = $1
			 LIMIT 1`,
			[visitorTalkId],
		)
		const visitorTalk = res.rows[0]
		if (!visitorTalk) {
			return { ok: false, message: "Charla de visitantes no encontrada", data: null }
		}
		if (!visitorTalk.isActive) {
			return { ok: false, message: "La charla de visitantes no está activa", data: null }
		}
		if (visitorTalk.expiresAt && new Date(visitorTalk.expiresAt) < new Date()) {
			return { ok: false, message: "La charla de visitantes ha expirado", data: null }
		}

		const companyEmails = visitorTalk.companyEmails ?? []
		const targetEmails = emails || companyEmails
		const filteredEmails = targetEmails.filter((email) => companyEmails.includes(email))
		if (!filteredEmails.length) {
			return { ok: false, message: "No hay emails válidos para enviar", data: null }
		}

		const emailResults = await Promise.allSettled(
			filteredEmails.map(async (email) => {
				await sendVisitorTalkInviteEmail({
					companyName: visitorTalk.companyName ?? "",
					visitorEmail: email,
					accessToken: visitorTalk.uniqueToken,
					expiresAt: visitorTalk.expiresAt
						? new Date(visitorTalk.expiresAt)
						: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
				})
				return { email, sent: true }
			}),
		)
		const successfulEmails = emailResults.filter(
			(r) => r.status === "fulfilled" && r.value.sent,
		).length

		return {
			ok: true,
			message: `Invitaciones reenviadas exitosamente: ${successfulEmails}/${filteredEmails.length}`,
			data: {
				emailsSent: successfulEmails,
				totalEmails: filteredEmails.length,
				visitorTalk,
			},
		}
	} catch (error) {
		console.error("[RESEND_VISITOR_TALK_INVITES]", error)
		return { ok: false, message: "Error interno del servidor", data: null }
	}
}
