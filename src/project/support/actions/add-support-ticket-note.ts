"use server"

import { headers } from "next/headers"

import { ACTIVITY_TYPE, MODULES } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { sendSupportTicketNoteEmail } from "@/project/support/actions/send-support-ticket-note-email"
import { addSupportTicketNoteSchema } from "@/project/support/schemas/support-ticket.schema"
import type { UploadResult } from "@/lib/upload-files"

export async function addSupportTicketNote(values: {
	ticketId: string
	content: string
	attachments?: UploadResult[]
}) {
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
		const parsed = addSupportTicketNoteSchema.parse(values)

		const ticket = await prisma.supportTicket.findUnique({
			where: { id: parsed.ticketId },
			select: {
				id: true,
				ticketNumber: true,
				title: true,
				requesterId: true,
				requester: {
					select: {
						name: true,
						email: true,
						accessRole: true,
					},
				},
			},
		})

		if (!ticket) {
			return { error: "Ticket no encontrado" }
		}

		const isAdmin = session.user.accessRole === "ADMIN"
		if (!isAdmin && ticket.requesterId !== session.user.id) {
			return { error: "No autorizado para agregar observaciones en este ticket" }
		}

		const note = await prisma.supportTicketNote.create({
			data: {
				content: parsed.content,
				supportTicketId: parsed.ticketId,
				userId: session.user.id,
			},
		})

		if (values.attachments?.length) {
			await prisma.supportTicketAttachment.createMany({
				data: values.attachments.map((att) => ({
					url: att.url,
					name: att.name,
					type: att.type || "application/octet-stream",
					size: att.size,
					userId: session.user.id,
					supportTicketId: parsed.ticketId,
					supportTicketNoteId: note.id,
				})),
			})
		}

		try {
			const hasAttachments = (values.attachments?.length ?? 0) > 0

			if (isAdmin) {
				await sendSupportTicketNoteEmail({
					to: [ticket.requester.email],
					recipientName: ticket.requester.name,
					commenterName: session.user.name,
					ticketNumber: ticket.ticketNumber,
					title: ticket.title,
					noteContent: parsed.content,
					hasAttachments,
					accessRole: ticket.requester.accessRole as "ADMIN" | "PARTNER_COMPANY",
				})
			} else {
				await sendSupportTicketNoteEmail({
					to: ["anghelo.alva@ingsimple.cl", "soporte@ingenieriasimple.cl"],
					recipientName: "Equipo de soporte",
					commenterName: session.user.name,
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
			userId: session.user.id,
			module: MODULES.CONTACT,
			action: ACTIVITY_TYPE.COMMENT,
			entityId: ticket.id,
			entityType: "SupportTicket",
			metadata: {
				ticketNumber: ticket.ticketNumber,
			},
		})

		return {
			success: "Observacion agregada exitosamente",
		}
	} catch (error) {
		console.error("[ADD_SUPPORT_TICKET_NOTE]", error)
		return {
			error: "Error al agregar observacion",
		}
	}
}
