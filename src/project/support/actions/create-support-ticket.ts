import {
	ACTIVITY_TYPE,
	MODULES,
	SUPPORT_TICKET_PRIORITY,
	SUPPORT_TICKET_TYPE,
} from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { getDemoUser } from "@/lib/demo-auth"
import { getDemoDb } from "@/lib/demo-db/client"
import { sendNewSupportTicketEmail } from "@/project/support/actions/send-new-support-ticket-email"
import { createSupportTicketSchema } from "@/project/support/schemas/support-ticket.schema"

import type { UploadResult as FileUploadResult } from "@/lib/upload-files"

interface CreateSupportTicketProps {
	values: {
		title: string
		type: SUPPORT_TICKET_TYPE
		priority: SUPPORT_TICKET_PRIORITY
		affectedModule?: string
		description: string
	}
	attachments?: FileUploadResult[]
}

const typeLabels = {
	[SUPPORT_TICKET_TYPE.INCIDENT]: "Incidencia",
	[SUPPORT_TICKET_TYPE.IMPROVEMENT]: "Mejora",
	[SUPPORT_TICKET_TYPE.QUERY]: "Consulta",
}

const priorityLabels = {
	[SUPPORT_TICKET_PRIORITY.HIGH]: "Alta",
	[SUPPORT_TICKET_PRIORITY.MEDIUM]: "Media",
	[SUPPORT_TICKET_PRIORITY.LOW]: "Baja",
}

export async function createSupportTicket({ values, attachments }: CreateSupportTicketProps) {
	const user = getDemoUser()
	if (!user) {
		return { ok: false, message: "No se pudo obtener la sesión del usuario" }
	}

	try {
		const parsed = createSupportTicketSchema.parse(values)
		const db = await getDemoDb()
		const now = new Date().toISOString()

		const counterResult = await db.query<{ value: number }>(
			`INSERT INTO "support_ticket_counter" ("id", "value")
			 VALUES ('support_ticket_counter', 1)
			 ON CONFLICT (id) DO UPDATE SET "value" = "support_ticket_counter"."value" + 1
			 RETURNING "value"`,
		)
		const counterValue = counterResult.rows[0]?.value ?? 1
		const year = new Date().getFullYear()
		const ticketNumber = `STK-${year}-${counterValue.toString().padStart(4, "0")}`

		const id = crypto.randomUUID()
		const affectedModule =
			parsed.affectedModule && parsed.affectedModule !== "NO_APLICA"
				? parsed.affectedModule
				: null

		await db.query(
			`INSERT INTO "support_ticket" (
				"id", "ticketNumber", "title", "type", "priority", "status",
				"affectedModule", "description", "requesterId", "companyId",
				"createdAt", "updatedAt"
			) VALUES ($1, $2, $3, $4, $5, 'REPORTED', $6, $7, $8, $9, $10, $10)`,
			[
				id,
				ticketNumber,
				parsed.title,
				parsed.type,
				parsed.priority,
				affectedModule,
				parsed.description,
				user.id,
				user.companyId ?? null,
				now,
			],
		)

		const noteId = crypto.randomUUID()
		await db.query(
			`INSERT INTO "support_ticket_note" (
				"id", "content", "supportTicketId", "userId", "createdAt", "updatedAt"
			) VALUES ($1, 'Ticket creado', $2, $3, $4, $4)`,
			[noteId, id, user.id, now],
		)

		if (attachments?.length) {
			for (const attachment of attachments) {
				await db.query(
					`INSERT INTO "support_ticket_attachment" (
						"id", "name", "url", "type", "size",
						"userId", "supportTicketId", "createdAt", "updatedAt"
					) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8)`,
					[
						crypto.randomUUID(),
						attachment.name,
						attachment.url,
						attachment.type || "image/jpeg",
						attachment.size ?? null,
						user.id,
						id,
						now,
					],
				)
			}
		}

		const requesterCompanyName = user.companyId
			? (
					await db.query<{ name: string }>(
						`SELECT name FROM "company" WHERE id = $1`,
						[user.companyId],
					)
				).rows[0]?.name ?? null
			: null

		await sendNewSupportTicketEmail({
			ticketNumber,
			title: parsed.title,
			requesterName: user.name,
			requesterEmail: user.email,
			companyName: requesterCompanyName,
			priority: priorityLabels[parsed.priority],
			type: typeLabels[parsed.type],
			affectedModule,
			description: parsed.description,
		})

		await logActivity({
			userId: user.id,
			module: MODULES.CONTACT,
			action: ACTIVITY_TYPE.CREATE,
			entityId: id,
			entityType: "SupportTicket",
			metadata: {
				ticketNumber,
				title: parsed.title,
				type: parsed.type,
				priority: parsed.priority,
			},
		})

		return {
			success: "Ticket creado exitosamente",
			id,
		}
	} catch (error) {
		console.error("[CREATE_SUPPORT_TICKET]", error)
		return { error: "Error al crear ticket de soporte" }
	}
}
