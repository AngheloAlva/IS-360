import { z } from "zod"

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export const lockoutPermitAttachmentFormSchema = z.object({
	userId: z.string().min(1, { message: "El ID del usuario es requerido" }),
	companyId: z.string().min(1, { message: "El ID de la empresa es requerido" }),
	lockoutPermitId: z.string().min(1, { message: "El ID del permiso de bloqueo es requerido" }),
	file: z
		.any()
		.refine((files) => files?.length > 0, "Debe seleccionar un archivo")
		.refine(
			(files) => files?.[0]?.size <= MAX_FILE_SIZE,
			"El archivo debe ser menor a 10MB"
		)
		.refine(
			(files) => ["application/pdf", "image/jpeg", "image/png", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(files?.[0]?.type),
			"Solo se permiten archivos PDF, JPG, PNG o DOCX"
		),
})

export type LockoutPermitAttachmentFormSchema = z.infer<typeof lockoutPermitAttachmentFormSchema>
