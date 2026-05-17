import { ACTIVITY_TYPE, MODULES } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { getDemoUser } from "@/lib/demo-auth"
import { getDemoDb } from "@/lib/demo-db/client"
import { sendSupportTicketNoteEmail } from "@/project/support/actions/send-support-ticket-note-email"
import { addSupportTicketNoteSchema } from "@/project/support/schemas/support-ticket.schema"

import type { UploadResult } from "@/lib/upload-files"

export async function addSupportTicketNote(values: {
	ticketId: string
	content: string
	attachments?: UploadResult[]
}) {
	const user = getDemoUser()
	if (!user) {
		return { ok: false, message: "No se pudo obtener la sesión del usuario" }
	}

	try {
		const parsed = addSupportTicketNoteSchema.parse(values)
		const db = await getDemoDb()

		const ticketResult = await db.query<{
			id: string
			ticketNumber: string
			title: string
			requesterId: string
			requesterName: string
			requesterEmail: string
			requesterAccessRole: string
		}>(
			`SELECT
				st.id, st."ticketNumber", st.title, st."requesterId",
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

		const isAdmin = user.accessRole === "ADMIN"
		if (!isAdmin && ticket.requesterId !== user.id) {
			return { error: "No autorizado para agregar observaciones en este ticket" }
		}

		const now = new Date().toISOString()
		const noteId = crypto.randomUUID()
		await db.query(
			`INSERT INTO "support_ticket_note" (
				"id", "content", "supportTicketId", "userId", "createdAt", "updatedAt"
			) VALUES ($1, $2, $3, $4, $5, $5)`,
			[noteId, parsed.content, parsed.ticketId, user.id, now],
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

		try {
			const hasAttachments = (values.attachments?.length ?? 0) > 0
			if (isAdmin) {
				await sendSupportTicketNoteEmail({
					to: [ticket.requesterEmail],
					recipientName: ticket.requesterName,
					commenterName: user.name,
					ticketNumber: ticket.ticketNumber,
					title: ticket.title,
					noteContent: parsed.content,
					hasAttachments,
					accessRole: ticket.requesterAccessRole as "ADMIN" | "PARTNER_COMPANY",
				})
			} else {
				await sendSupportTicketNoteEmail({
					to: ["demo@ingsimple.cl"],
					recipientName: "Equipo de soporte",
					commenterName: user.name,
					ticketNumber: ticket.ticketNumber,
					title: ticket.title,
					noteContent: parsed.content,
					hasAttachments,
					accessRole: "ADMIN",
				})
			}
		} catch (emailError) {
			console.error("[ADD_SUPPORT_TICKET_NOTE_EMAIL]", emailError)
		}

		await logActivity({
			userId: user.id,
			module: MODULES.CONTACT,
			action: ACTIVITY_TYPE.COMMENT,
			entityId: ticket.id,
			entityType: "SupportTicket",
			metadata: { ticketNumber: ticket.ticketNumber },
		})

		return { success: "Observacion agregada exitosamente" }
	} catch (error) {
		console.error("[ADD_SUPPORT_TICKET_NOTE]", error)
		return { error: "Error al agregar observacion" }
	}
}
