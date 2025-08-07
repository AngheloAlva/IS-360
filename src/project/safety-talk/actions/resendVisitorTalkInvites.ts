"use server"

import { sendVisitorTalkInviteEmail } from "@/project/safety-talk/actions/sendVisitorTalkInviteEmail"
import prisma from "@/lib/prisma"

interface ResendVisitorTalkInvitesProps {
	visitorTalkId: string
	emails?: string[]
}

export async function resendVisitorTalkInvites({
	visitorTalkId,
	emails,
}: ResendVisitorTalkInvitesProps) {
	try {
		// Get visitor talk with company information
		const visitorTalk = await prisma.visitorTalk.findUnique({
			where: { id: visitorTalkId },
			include: {
				company: {
					include: {
						visitors: true,
					},
				},
			},
		})

		if (!visitorTalk) {
			return {
				ok: false,
				message: "Charla de visitantes no encontrada",
				data: null,
			}
		}

		if (!visitorTalk.isActive) {
			return {
				ok: false,
				message: "La charla de visitantes no está activa",
				data: null,
			}
		}

		if (visitorTalk.expiresAt && visitorTalk.expiresAt < new Date()) {
			return {
				ok: false,
				message: "La charla de visitantes ha expirado",
				data: null,
			}
		}

		// Determine which emails to send to
		const targetEmails = emails || visitorTalk.company.emails
		const filteredEmails = targetEmails.filter((email) =>
			visitorTalk.company.emails.includes(email)
		)

		if (filteredEmails.length === 0) {
			return {
				ok: false,
				message: "No hay emails válidos para enviar",
				data: null,
			}
		}

		// Send invitation emails
		const emailPromises = filteredEmails.map(async (email) => {
			try {
				await sendVisitorTalkInviteEmail({
					companyName: visitorTalk.company.name,
					visitorEmail: email,
					accessToken: visitorTalk.uniqueToken,
					expiresAt: visitorTalk.expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
				})
				return { email, sent: true }
			} catch (error) {
				console.error(`Error sending email to ${email}:`, error)
				return { email, sent: false, error }
			}
		})

		const emailResults = await Promise.allSettled(emailPromises)
		const successfulEmails = emailResults.filter(
			(result) => result.status === "fulfilled" && result.value.sent
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
		console.error("Error resending visitor talk invites:", error)
		return {
			ok: false,
			message: "Error interno del servidor",
			data: null,
		}
	}
}
