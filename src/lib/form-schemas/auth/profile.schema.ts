import { z } from "zod"
import { fileSchema } from "../document-management/file.schema"

export const profileFormSchema = z.object({
	name: z.string().min(1, "El nombre es requerido"),
	phone: z.string().optional(),
	image: fileSchema.optional(),
})

export type ProfileFormSchema = z.infer<typeof profileFormSchema>
