import { z } from "zod"

import { DocumentAreasValuesArray } from "@/lib/consts/areas"
import { fileSchema } from "@/shared/schemas/file.schema"

export const fileFormSchema = z.object({
	userId: z.string(),
	parentFolderId: z.string().optional(),

	area: z.enum(DocumentAreasValuesArray, { message: "El área es requerido" }),
	code: z.string({ message: "El código es requerido" }),
	otherCode: z.string().optional(),
	registrationDate: z.date({ message: "La fecha de registro es requerida" }),
	expirationDate: z.date().optional(),
	name: z.string().optional(),
	description: z.string().optional(),
	files: z.array(fileSchema).min(1, { message: "Se requiere al menos un archivo" }),
})

export type FileFormSchema = z.infer<typeof fileFormSchema>
