import { z } from "zod"

export const uploadDocumentsSchema = z.object({
	file: z.instanceof(File).optional(),
	documentType: z.string().min(1, "El tipo de documento es obligatorio"),
	documentName: z.string().min(1, "El nombre del documento es obligatorio"),
	expirationDate: z.date({
		required_error: "La fecha de vencimiento es obligatoria",
		invalid_type_error: "La fecha de vencimiento debe ser válida",
	}),
})

export type UploadDocumentsFormData = z.infer<typeof uploadDocumentsSchema>
