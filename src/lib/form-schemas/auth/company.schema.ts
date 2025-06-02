import { z } from "zod"

import { fileSchema } from "../document-management/file.schema"

export const companyFormSchema = z.object({
	name: z.string(),
	rut: z.string(),
	image: fileSchema.optional(),
})

export type CompanyFormSchema = z.infer<typeof companyFormSchema>
