import { z } from "zod"

import { fileSchema } from "@/shared/schemas/file.schema"
import { WORKER_LABOR_CONTROL_DOCUMENT_TYPE, LABOR_CONTROL_DOCUMENT_TYPE } from "@prisma/client"

export const updateWorkerDocumentSchema = z.object({
	documentId: z.string(),
	file: z.array(fileSchema).min(1, { message: "Se requiere subir un archivo" }),
	documentName: z.string().optional(),
	documentType: z
		.nativeEnum({
			...WORKER_LABOR_CONTROL_DOCUMENT_TYPE,
			...LABOR_CONTROL_DOCUMENT_TYPE,
		})
		.optional(),
})

export type UpdateWorkerDocumentSchema = z.infer<typeof updateWorkerDocumentSchema>
