import { z } from "zod"

import { ReviewStatus } from "@/generated/prisma/enums"

export const updateWorkerFolderConfigSchema = z.object({
	startupFolderId: z.string().min(1, "ID de carpeta de arranque requerido"),
	workerId: z.string().min(1, "ID del trabajador requerido"),
	newStatus: z.nativeEnum(ReviewStatus),
	isDriver: z.boolean(),
	reason: z.string().min(1, "Motivo del cambio requerido").max(500, "Motivo muy largo"),
	confirmDeleteDriverDocs: z.boolean().optional(),
})

export type UpdateWorkerFolderConfigSchema = z.infer<typeof updateWorkerFolderConfigSchema>
