import { z } from "zod"

export const markDocumentAsNotAppliedSchema = z.object({
	userId: z.string().min(1, "Usuario requerido"),
	folderId: z.string().min(1, "Carpeta requerida"),
	documentType: z.string().min(1, "Tipo de documento requerido"),
	documentName: z.string().min(1, "Nombre de documento requerido"),
	category: z.string().min(1, "Categoría requerida"),
	workerId: z.string().optional(),
	vehicleId: z.string().optional(),
})

export type MarkDocumentAsNotAppliedInput = z.infer<typeof markDocumentAsNotAppliedSchema>
