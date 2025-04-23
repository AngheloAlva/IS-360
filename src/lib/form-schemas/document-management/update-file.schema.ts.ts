import { z } from "zod"

import { fileSchema } from "./file.schema"

export const updateFileSchema = z.object({
	userId: z.string(),
	fileId: z.string(),
	folderSlug: z.string().optional(),
	code: z.string({ message: "El código es requerido" }),
	otherCode: z.string().optional(),
	registrationDate: z.date({ message: "La fecha de registro es requerida" }),
	expirationDate: z.date().optional(),
	name: z.string().optional(),
	description: z.string().optional(),
	revisionCount: z.string().optional(),

	file: z.array(fileSchema).min(1).max(1),
})

export type UpdateFileSchema = z.infer<typeof updateFileSchema>
