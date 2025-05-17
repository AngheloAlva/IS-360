import { z } from "zod"

import { fileSchema } from "../document-management/file.schema"

export const uploadStartupFolderDocumentSchema = z.object({
	folderId: z.string(),
	documentId: z.string(),
	name: z.string().optional(),
	files: z.array(fileSchema).min(1, { message: "Se requiere subir un archivo" }),
	type: z.string(),
	expirationDate: z.date({ message: "La fecha de vencimiento es requerida" }),
	workerId: z.string().optional(),
	vehicleId: z.string().optional(),
})

export type UploadStartupFolderDocumentSchema = z.infer<typeof uploadStartupFolderDocumentSchema>
