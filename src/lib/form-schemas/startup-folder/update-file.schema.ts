import { z } from "zod"

import { fileSchema } from "../document-management/file.schema"

export const updateStartupFolderDocumentSchema = z.object({
	documentId: z.string(),
	file: z.array(fileSchema).min(1, { message: "Se requiere subir un archivo" }),
	expirationDate: z.date({ message: "La fecha de vencimiento es requerida" }),
})

export type UpdateStartupFolderDocumentSchema = z.infer<typeof updateStartupFolderDocumentSchema>
