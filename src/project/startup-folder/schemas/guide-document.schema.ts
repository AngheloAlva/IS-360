import { z } from "zod"

export const guideDocumentSchema = z.object({
	name: z.string().min(1, "El nombre es requerido"),
	description: z.string().optional(),
	url: z.string().url("Debe ser una URL válida"),
	type: z.string().min(1, "El tipo de archivo es requerido"),
	size: z.number().int().positive().optional(),
	visibility: z.enum(["BASIC", "FULL", "BOTH"]),
	order: z.coerce.number().int().min(0),
})

export const updateGuideDocumentSchema = guideDocumentSchema.partial().extend({
	id: z.string().min(1, "El ID es requerido"),
})

export const deleteGuideDocumentSchema = z.object({
	id: z.string().min(1, "El ID es requerido"),
})

export type GuideDocumentInput = z.output<typeof guideDocumentSchema>
export type UpdateGuideDocumentInput = z.infer<typeof updateGuideDocumentSchema>
export type DeleteGuideDocumentInput = z.infer<typeof deleteGuideDocumentSchema>
