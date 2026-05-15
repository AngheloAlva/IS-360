import { z } from "zod"

import { TASK_FREQUENCY_VALUES_ARRAY } from "@/lib/consts/task-frequency"
import { fileSchema } from "../../../shared/schemas/file.schema"
import {
	TASK_SPECIALTY,
	TASK_TYPE,
	WORK_ORDER_CAPEX,
	WORK_ORDER_PRIORITY,
	WORK_ORDER_TYPE,
} from "@/generated/prisma/enums"

export const maintenancePlanTaskSchema = z.object({
	name: z.string().min(1, "El nombre es requerido"),
	description: z.string().optional(),
	frequency: z.enum(TASK_FREQUENCY_VALUES_ARRAY, {
		error: "La frecuencia es requerida",
	}),
	nextDate: z.date({
		error: "La fecha de próxima ejecución es requerida",
	}),
	equipmentId: z.string().optional(),
	equipmentIds: z.array(z.string()).optional(),
	specialty: z.nativeEnum(TASK_SPECIALTY).optional(),
	taskType: z.nativeEnum(TASK_TYPE).optional(),
	maintenancePlanSlug: z.string(),
	createdById: z.string().min(1, "El creador es requerido"),
	attachments: z.array(fileSchema),
	// Campos de automatización
	isAutomated: z.boolean().optional(),
	automatedResponsibleId: z
		.string({ error: "El responsable OTC es requerido" })
		.min(1, "El responsable OTC es requerido"),
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
	automatedEstimatedDaysByMonth: z.boolean().optional(),
	automatedEstimatedHours: z
		.string()
		.regex(/^[0-9]+$/)
		.optional(),
	automatedDaysInAdvance: z
		.string()
		.regex(/^[0-9]+$/)
		.optional(),
	automatedWorkDescription: z.string().optional(),
	blockIfPreviousNotCompleted: z.boolean().optional(),
	emailsForCopy: z.array(z.string()).optional(),
})

export type MaintenancePlanTaskSchema = z.infer<typeof maintenancePlanTaskSchema>
