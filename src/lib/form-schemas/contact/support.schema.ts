import { z } from "zod"

import { fileSchema } from "../document-management/file.schema"

export const supportFormSchema = z.object({
	message: z.string().min(1, { message: "El mensaje es requerido" }),
	files: z.array(fileSchema).optional(),
})

export type SupportFormSchema = z.infer<typeof supportFormSchema>
