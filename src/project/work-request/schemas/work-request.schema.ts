import { z } from "zod"

import { fileSchema } from "@/shared/schemas/file.schema"

export const LOCATION_VALUES_ARRAY = ["TRM", "PRS", "OTHER"] as const

export const workRequestSchema = z.object({
	description: z.string().min(1, { message: "La descripción no puede estar vacía" }),
	isUrgent: z.boolean().default(false).optional(),
	requestDate: z.date({ message: "La fecha de solicitud no es válida" }),
	observations: z.string().optional(),
	location: z.enum(LOCATION_VALUES_ARRAY, { message: "La ubicación no es válida" }),
	customLocation: z.string().optional(),
	attachments: z.array(fileSchema).optional(),
})

export type WorkRequestSchema = z.infer<typeof workRequestSchema>
