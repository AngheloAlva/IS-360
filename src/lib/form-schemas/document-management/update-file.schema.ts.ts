import { z } from "zod"

export const updateFileSchema = z.object({
	userId: z.string(),
	folderSlug: z.string().optional(),
	code: z.string({ message: "El código es requerido" }),
	otherCode: z.string().optional(),
	registrationDate: z.date({ message: "La fecha de registro es requerida" }),
	expirationDate: z.date().optional(),
	name: z.string().optional(),
	description: z.string().optional(),
})

export type UpdateFileSchema = z.infer<typeof updateFileSchema>
