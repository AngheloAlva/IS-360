import { ACTIVITY_TYPE, MODULES, SUPPORT_TICKET_STATUS } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { getDemoUser } from "@/lib/demo-auth"
import { getDemoDb } from "@/lib/demo-db/client"
import { sendSupportTicketStatusEmail } from "@/project/support/actions/send-support-ticket-status-email"
import { updateSupportTicketStatusSchema } from "@/project/support/schemas/support-ticket.schema"

import type { UploadResult } from "@/lib/upload-files"

const statusLabels = {
	[SUPPORT_TICKET_STATUS.REPORTED]: "Reportado",
	[SUPPORT_TICKET_STATUS.IN_PROGRESS]: "En proceso",
	[SUPPORT_TICKET_STATUS.RESOLVED]: "Resuelto",
	[SUPPORT_TICKET_STATUS.REJECTED]: "Rechazado",
}

export async function updateSupportTicketStatus(values: {
	ticketId: string
	status: SUPPORT_TICKET_STATUS
	note?: string
	attachments?: UploadResult[]
}) {
	const user = getDemoUser()
	if (!user) {
		return { ok: false, message: "No se pudo obtener la sesión del usuario" }
	}
	if (user.accessRole !== "ADMIN") {
		return { error: "Solo administradores pueden cambiar el estado" }
	}

	try {
		const parsed = updateSupportTicketStatusSchema.parse(values)
		const db = await getDemoDb()

		const ticketResult = await db.query<{
			id: string
			ticketNumber: string
			title: string
			startedAt: string | null
			requesterName: string
			requesterEmail: string
			requesterAccessRole: string
		}>(
			`SELECT
				st.id, st."ticketNumber", st.title, st."startedAt",
				u.name AS "requesterName",
				u.email AS "requesterEmail",
				u."accessRole" AS "requesterAccessRole"
			 FROM "support_ticket" st
			 LEFT JOIN "user" u ON u.id = st."requesterId"
			 WHERE st.id = $1`,
			[parsed.ticketId],
		)
		const ticket = ticketResult.rows[0]
		if (!ticket) {
			return { error: "Ticket no encontrado" }
		}

		const now = new Date().toISOString()
		const startedAt =
			parsed.status === SUPPORT_TICKET_STATUS.IN_PROGRESS
				? now
				: (ticket.startedAt ?? null)
		const resolvedAt = parsed.status === SUPPORT_TICKET_STATUS.RESOLVED ? now : null
		const rejectedAt = parsed.status === SUPPORT_TICKET_STATUS.REJECTED ? now : null

		await db.query(
			`UPDATE "support_ticket"
			 SET "status" = $1, "startedAt" = $2, "resolvedAt" = $3, "rejectedAt" = $4, "updatedAt" = $5
			 WHERE id = $6`,
			[parsed.status, startedAt, resolvedAt, rejectedAt, now, parsed.ticketId],
		)

		if (parsed.note) {
			const noteId = crypto.randomUUID()
			await db.query(
				`INSERT INTO "support_ticket_note" (
					"id", "content", "supportTicketId", "userId", "createdAt", "updatedAt"
				) VALUES ($1, $2, $3, $4, $5, $5)`,
				[noteId, parsed.note, parsed.ticketId, user.id, now],
			)

			if (values.attachments?.length) {
				for (const att of values.attachments) {
					await db.query(
						`INSERT INTO "support_ticket_attachment" (
							"id", "name", "url", "type", "size",
							"userId", "supportTicketId", "supportTicketNoteId",
							"createdAt", "updatedAt"
						) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $9)`,
						[
							crypto.randomUUID(),
							att.name,
							att.url,
							att.type || "application/octet-stream",
							att.size ?? null,
							user.id,
							parsed.ticketId,
							noteId,
							now,
						],
					)
				}
			}
		}

		try {
			await sendSupportTicketStatusEmail({
				name: ticket.requesterName,
				email: ticket.requesterEmail,
				ticketNumber: ticket.ticketNumber,
				title: ticket.title,
				statusLabel: statusLabels[parsed.status],
				note: parsed.note,
				accessRole: ticket.requesterAccessRole as "ADMIN" | "PARTNER_COMPANY",
			})
		} catch (emailError) {
			console.error("[UPDATE_SUPPORT_TICKET_STATUS_EMAIL]", emailError)
		}

		await logActivity({
			userId: user.id,
			module: MODULES.CONTACT,
			action: ACTIVITY_TYPE.UPDATE,
			entityId: parsed.ticketId,
			entityType: "SupportTicket",
			metadata: { ticketNumber: ticket.ticketNumber, status: parsed.status },
		})

		return { success: "Estado actualizado correctamente" }
	} catch (error) {
		console.error("[UPDATE_SUPPORT_TICKET_STATUS]", error)
		return { error: "Error al actualizar estado del ticket" }
	}
}
