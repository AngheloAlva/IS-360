"use server"

import { headers } from "next/headers"

import { ACTIVITY_TYPE, MODULES, SUPPORT_TICKET_STATUS } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
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
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user?.id) {
		return {
			ok: false,
			message: "No se pudo obtener la sesión del usuario",
		}
	}

	if (session.user.accessRole !== "ADMIN") {
		return {
			error: "Solo administradores pueden cambiar el estado",
		}
	}

	try {
		const parsed = updateSupportTicketStatusSchema.parse(values)

		const ticket = await prisma.supportTicket.findUnique({
			where: { id: parsed.ticketId },
			include: {
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
			return {
				error: "Ticket no encontrado",
			}
		}

		const now = new Date()
		const updatedTicket = await prisma.supportTicket.update({
			where: {
				id: parsed.ticketId,
			},
			data: {
				status: parsed.status,
				startedAt: parsed.status === SUPPORT_TICKET_STATUS.IN_PROGRESS ? now : ticket.startedAt,
				resolvedAt: parsed.status === SUPPORT_TICKET_STATUS.RESOLVED ? now : null,
				rejectedAt: parsed.status === SUPPORT_TICKET_STATUS.REJECTED ? now : null,
			},
		})

		if (parsed.note) {
			const note = await prisma.supportTicketNote.create({
				data: {
					content: parsed.note,
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
		}

		try {
			await sendSupportTicketStatusEmail({
				name: ticket.requester.name,
				email: ticket.requester.email,
				ticketNumber: ticket.ticketNumber,
				title: ticket.title,
				statusLabel: statusLabels[parsed.status],
				note: parsed.note,
				accessRole: ticket.requester.accessRole as "ADMIN" | "PARTNER_COMPANY",
			})
		} catch (emailError) {
			console.error("[UPDATE_SUPPORT_TICKET_STATUS_EMAIL]", emailError)
		}

		await logActivity({
			userId: session.user.id,
			module: MODULES.CONTACT,
			action: ACTIVITY_TYPE.UPDATE,
			entityId: updatedTicket.id,
			entityType: "SupportTicket",
			metadata: {
				ticketNumber: ticket.ticketNumber,
				status: updatedTicket.status,
			},
		})

		return {
			success: "Estado actualizado correctamente",
		}
	} catch (error) {
		console.error("[UPDATE_SUPPORT_TICKET_STATUS]", error)
		return {
			error: "Error al actualizar estado del ticket",
		}
	}
}
