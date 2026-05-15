import { z } from "zod"

export const deleteStartupFolderSchema = z.object({
	startupFolderId: z.string().uuid({
		message: "El ID de la carpeta de arranque debe ser un UUID válido",
	}),
})

export type DeleteStartupFolderSchema = z.infer<typeof deleteStartupFolderSchema>
