import { z } from "zod"

import { StartupFolderType } from "@prisma/client"

export const newStartupFolderSchema = z.object({
	name: z.string({ message: "El nombre es requerido." }).min(2, {
		message: "El nombre debe tener al menos 2 caracteres.",
	}),
	type: z.nativeEnum(StartupFolderType),
	moreMonthDuration: z.boolean().default(false).optional(),
})

export type NewStartupFolderSchema = z.infer<typeof newStartupFolderSchema>
