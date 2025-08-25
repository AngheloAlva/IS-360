import { z } from "zod"

import { TASK_FREQUENCY_VALUES_ARRAY } from "@/lib/consts/task-frequency"
import { fileSchema } from "../../../shared/schemas/file.schema"
import { WORK_ORDER_CAPEX, WORK_ORDER_PRIORITY, WORK_ORDER_TYPE } from "@prisma/client"

export const maintenancePlanTaskSchema = z.object({
	name: z.string().min(1, "El nombre es requerido"),
	description: z.string().optional(),
	frequency: z.enum(TASK_FREQUENCY_VALUES_ARRAY, {
		required_error: "La frecuencia es requerida",
	}),
	nextDate: z.date({
		required_error: "La fecha de próxima ejecución es requerida",
	}),
	equipmentId: z.string().optional(),
	maintenancePlanSlug: z.string(),
	createdById: z.string().min(1, "El creador es requerido"),
	attachments: z.array(fileSchema),
	// Campos de automatización
	isAutomated: z.boolean().optional(),
	automatedSupervisorId: z.string().optional(),
	automatedCompanyId: z.string().optional(),
	// Campos para configurar la OT automática
	automatedWorkOrderType: z.nativeEnum(WORK_ORDER_TYPE).optional(),
	automatedPriority: z.nativeEnum(WORK_ORDER_PRIORITY).optional(),
	automatedCapex: z.nativeEnum(WORK_ORDER_CAPEX).optional(),
	automatedEstimatedDays: z
		.string()
		.regex(/^[0-9]+$/)
		.optional(),
	automatedEstimatedHours: z
		.string()
		.regex(/^[0-9]+$/)
		.optional(),
	automatedWorkDescription: z.string().optional(),
	emailsForCopy: z.array(z.string()).optional(),
})

export type MaintenancePlanTaskSchema = z.infer<typeof maintenancePlanTaskSchema>
