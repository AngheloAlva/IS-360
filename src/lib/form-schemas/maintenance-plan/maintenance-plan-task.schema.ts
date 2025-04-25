import { z } from "zod"

import { WORK_ORDER_PRIORITY_VALUES_ARRAY } from "@/lib/consts/work-order-priority"
import { WORK_ORDER_CAPEX_VALUES_ARRAY } from "@/lib/consts/work-order-capex"
import { WORK_ORDER_TYPE_VALUES_ARRAY } from "@/lib/consts/work-order-types"
import { TASK_FREQUENCY_VALUES_ARRAY } from "@/lib/consts/task-frequency"
import { fileSchema } from "../document-management/file.schema"

export const maintenancePlanTaskSchema = z.object({
	name: z.string().min(1, { message: "El nombre no puede estar vacío" }),
	description: z.string().min(1, { message: "La descripción no puede estar vacía" }),
	frequency: z.enum(TASK_FREQUENCY_VALUES_ARRAY, { message: "La frecuencia es requerida" }),
	workOrderType: z.enum(WORK_ORDER_TYPE_VALUES_ARRAY, {
		message: "El tipo de trabajo es requerido",
	}),
	workOrderCapex: z.enum(WORK_ORDER_CAPEX_VALUES_ARRAY, { message: "El capex es requerido" }),
	workOrderPriority: z.enum(WORK_ORDER_PRIORITY_VALUES_ARRAY, {
		message: "La prioridad es requerida",
	}),
	nextDate: z.date({ message: "La fecha es requerida" }),
	estimatedDays: z.string({ message: "Los días es requerido" }),
	estimatedHours: z.string({ message: "Las horas es requerido" }),
	isInternalResponsible: z.boolean({ message: "El responsable es requerido" }),
	responsibleId: z.string({ message: "El responsable es requerido" }),
	equipmentId: z.string({ message: "El equipo es requerido" }),
	companyId: z.string({ message: "La empresa es requerida" }),
	maintenancePlanSlug: z.string(),
	createdById: z.string(),
	attachments: z.array(fileSchema),
})

export type MaintenancePlanTaskSchema = z.infer<typeof maintenancePlanTaskSchema>
