import { z } from "zod"

import { fileSchema } from "../../document-management/file.schema"
import { CRITICALITY_ARRAY } from "@/lib/consts/criticality"

export const equipmentSchema = z.object({
	name: z.string().min(1, { message: "El nombre es requerido" }).max(255),
	description: z.string().optional(),
	location: z.string().min(1, { message: "La ubicación es requerida" }),
	isOperational: z.boolean().optional(),
	type: z.string().optional(),
	tag: z.string().min(1, { message: "El tag es requerido" }),
	files: z.array(fileSchema),
	criticality: z.enum(CRITICALITY_ARRAY, { message: "La criticalidad es requerida" }).optional(),

	parentId: z.string().optional(),
})

export type EquipmentSchema = z.infer<typeof equipmentSchema>
