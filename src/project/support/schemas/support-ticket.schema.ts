import { z } from "zod"

import {
	SUPPORT_TICKET_PRIORITY,
	SUPPORT_TICKET_STATUS,
	SUPPORT_TICKET_TYPE,
} from "@/generated/prisma/enums"
import { fileSchema } from "@/shared/schemas/file.schema"
import { uploadResultSchema } from "@/shared/schemas/upload-result.schema"

export const createSupportTicketSchema = z.object({
	title: z.string().trim().min(5, "El nombre debe tener al menos 5 caracteres"),
	type: z.enum([
		SUPPORT_TICKET_TYPE.INCIDENT,
		SUPPORT_TICKET_TYPE.IMPROVEMENT,
		SUPPORT_TICKET_TYPE.QUERY,
	]),
	priority: z.enum([
		SUPPORT_TICKET_PRIORITY.HIGH,
		SUPPORT_TICKET_PRIORITY.MEDIUM,
		SUPPORT_TICKET_PRIORITY.LOW,
	]),
	affectedModule: z.string().optional(),
	description: z.string().trim().min(10, "La descripcion debe tener al menos 10 caracteres"),
	attachments: z.array(fileSchema).optional(),
})

export const updateSupportTicketStatusSchema = z.object({
	ticketId: z.string().min(1),
	status: z.enum([
		SUPPORT_TICKET_STATUS.REPORTED,
		SUPPORT_TICKET_STATUS.IN_PROGRESS,
		SUPPORT_TICKET_STATUS.RESOLVED,
		SUPPORT_TICKET_STATUS.REJECTED,
	]),
	note: z.string().trim().optional(),
	attachments: z.array(uploadResultSchema).optional(),
})

export const addSupportTicketNoteSchema = z.object({
	ticketId: z.string().min(1),
	content: z.string().trim().min(2, "La observacion debe tener al menos 2 caracteres"),
	attachments: z.array(uploadResultSchema).optional(),
})

export type CreateSupportTicketSchema = z.infer<typeof createSupportTicketSchema>
export type UpdateSupportTicketStatusSchema = z.infer<typeof updateSupportTicketStatusSchema>
export type AddSupportTicketNoteSchema = z.infer<typeof addSupportTicketNoteSchema>
