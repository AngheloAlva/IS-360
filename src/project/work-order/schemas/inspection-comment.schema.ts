import { z } from "zod"

import { INSPECTION_COMMENT_TYPE } from "@/generated/prisma/enums"

import { fileSchema } from "@/shared/schemas/file.schema"

export const inspectionCommentSchema = z.object({
	workEntryId: z.string().min(1, "ID de la inspección es requerido"),
	content: z.string().min(1, "El contenido del comentario es requerido"),
	type: z.nativeEnum(INSPECTION_COMMENT_TYPE),
	files: z.array(fileSchema).optional(),
})

export type InspectionCommentSchema = z.infer<typeof inspectionCommentSchema>
