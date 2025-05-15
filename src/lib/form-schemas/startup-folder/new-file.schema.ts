import { z } from "zod"

import { fileSchema } from "../document-management/file.schema"

export const uploadStartupFolderDocumentSchema = z.object({
	folderId: z.string(),
	name: z.string().optional(),
	files: z.array(fileSchema).min(1, { message: "Se requiere subir un archivo" }),
	type: z.string(),
})

export type UploadStartupFolderDocumentSchema = z.infer<typeof uploadStartupFolderDocumentSchema>
