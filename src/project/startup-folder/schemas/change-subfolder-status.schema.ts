import { z } from "zod"

import { ReviewStatus } from "@prisma/client"

export const changeSubfolderStatusSchema = z.object({
	startupFolderId: z.string().min(1, "ID de carpeta de arranque requerido"),
	subfolderType: z.enum([
		"SAFETY_AND_HEALTH",
		"ENVIRONMENTAL",
		"ENVIRONMENT",
		"TECHNICAL_SPECS",
		"WORKER",
		"VEHICLE",
		"BASIC",
	]),
	newStatus: z.nativeEnum(ReviewStatus),
	entityId: z.string().optional(),
	reason: z.string().min(1, "Motivo del cambio requerido").max(500, "Motivo muy largo"),
})

export type ChangeSubfolderStatusSchema = z.infer<typeof changeSubfolderStatusSchema>
