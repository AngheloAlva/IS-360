import { z } from "zod"

import { TASK_FREQUENCY_VALUES_ARRAY } from "@/lib/consts/task-frequency"
import { fileSchema } from "../../../shared/schemas/file.schema"

export const maintenancePlanTaskSchema = z.object({
	name: z.string().min(1, { message: "El nombre no puede estar vacío" }),
	description: z.string().optional(),
	frequency: z.enum(TASK_FREQUENCY_VALUES_ARRAY, { message: "La frecuencia es requerida" }),
	nextDate: z.date({ message: "La fecha es requerida" }),
	equipmentId: z.string().optional(),
	maintenancePlanSlug: z.string(),
	createdById: z.string(),
	attachments: z.array(fileSchema),
})

export type MaintenancePlanTaskSchema = z.infer<typeof maintenancePlanTaskSchema>
