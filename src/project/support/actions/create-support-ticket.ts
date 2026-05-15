"use server"

import { headers } from "next/headers"

import {
	ACTIVITY_TYPE,
	MODULES,
	SUPPORT_TICKET_PRIORITY,
	SUPPORT_TICKET_TYPE,
} from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
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
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return {
			ok: false,
			message: "No se pudo obtener la sesión del usuario",
		}
	}

	try {
		const parsed = createSupportTicketSchema.parse(values)

		const counter = await prisma.supportTicketCounter.upsert({
			where: { id: "support_ticket_counter" },
			update: { value: { increment: 1 } },
			create: { id: "support_ticket_counter", value: 1 },
		})

		const year = new Date().getFullYear()
		const ticketNumber = `STK-${year}-${counter.value.toString().padStart(4, "0")}`

		const newTicket = await prisma.supportTicket.create({
			data: {
				ticketNumber,
				title: parsed.title,
				type: parsed.type,
				priority: parsed.priority,
				affectedModule:
					parsed.affectedModule && parsed.affectedModule !== "NO_APLICA"
						? (parsed.affectedModule as MODULES)
						: null,
				description: parsed.description,
				requesterId: session.user.id,
				companyId: session.user.companyId || null,
				notes: {
					create: {
						content: "Ticket creado",
						userId: session.user.id,
					},
				},
				...(attachments && attachments.length > 0
					? {
							attachments: {
								create: attachments.map((attachment) => ({
									url: attachment.url,
									name: attachment.name,
									type: attachment.type || "image/jpeg",
									size: attachment.size,
									userId: session.user.id,
								})),
							},
						}
					: {}),
			},
			include: {
				requester: {
					select: {
						name: true,
						email: true,
						company: {
							select: {
								name: true,
							},
						},
					},
				},
			},
		})

		await sendNewSupportTicketEmail({
			ticketNumber: newTicket.ticketNumber,
			title: newTicket.title,
			requesterName: newTicket.requester.name,
			requesterEmail: newTicket.requester.email,
			companyName: newTicket.requester.company?.name,
			priority: priorityLabels[newTicket.priority],
			type: typeLabels[newTicket.type],
			affectedModule: newTicket.affectedModule,
			description: newTicket.description,
		})

		await logActivity({
			userId: session.user.id,
			module: MODULES.CONTACT,
			action: ACTIVITY_TYPE.CREATE,
			entityId: newTicket.id,
			entityType: "SupportTicket",
			metadata: {
				ticketNumber: newTicket.ticketNumber,
				title: newTicket.title,
				type: newTicket.type,
				priority: newTicket.priority,
			},
		})

		return {
			success: "Ticket creado exitosamente",
			id: newTicket.id,
		}
	} catch (error) {
		console.error("[CREATE_SUPPORT_TICKET]", error)
		return {
			error: "Error al crear ticket de soporte",
		}
	}
}
