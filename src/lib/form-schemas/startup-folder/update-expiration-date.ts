import { z } from "zod"

export const updateExpirationDateDocumentSchema = z.object({
	folderId: z.string(),
	documentId: z.string(),
	expirationDate: z.date({ message: "La fecha de vencimiento es requerida" }),
})

export type UpdateExpirationDateSchema = z.infer<typeof updateExpirationDateDocumentSchema>
