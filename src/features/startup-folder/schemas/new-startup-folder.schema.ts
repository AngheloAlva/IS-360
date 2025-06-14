import { z } from "zod"

export const newStartupFolderSchema = z.object({
	name: z.string({ message: "El nombre es requerido." }).min(2, {
		message: "El nombre debe tener al menos 2 caracteres.",
	}),
})

export type NewStartupFolderSchema = z.infer<typeof newStartupFolderSchema>
