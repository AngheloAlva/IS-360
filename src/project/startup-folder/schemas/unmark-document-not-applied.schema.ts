import { z } from "zod"

export const unmarkDocumentAsNotAppliedSchema = z.object({
	userId: z.string().min(1, "Usuario requerido"),
	folderId: z.string().min(1, "Carpeta requerida"),
	documentId: z.string().min(1, "Documento requerido"),
	category: z.string().min(1, "Categoría requerida"),
	workerId: z.string().optional(),
	vehicleId: z.string().optional(),
})

export type UnmarkDocumentAsNotAppliedInput = z.infer<typeof unmarkDocumentAsNotAppliedSchema>
