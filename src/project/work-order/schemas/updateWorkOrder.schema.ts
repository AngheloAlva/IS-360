import { WORK_ORDER_PRIORITY_VALUES_ARRAY } from "@/lib/consts/work-order-priority"
import { WORK_ORDER_STATUS_VALUES_ARRAY } from "@/lib/consts/work-order-status"
import { WORK_ORDER_CAPEX_VALUES_ARRAY } from "@/lib/consts/work-order-capex"
import { WORK_ORDER_TYPE_VALUES_ARRAY } from "@/lib/consts/work-order-types"
import { z } from "zod"
import { fileSchema } from "@/shared/schemas/file.schema"

export const updateWorkOrderSchema = z.object({
	type: z.enum(WORK_ORDER_TYPE_VALUES_ARRAY, { message: "El tipo no es válido" }),
	status: z.enum(WORK_ORDER_STATUS_VALUES_ARRAY, { message: "El estado no es válido" }),
	solicitationDate: z.date({ message: "La fecha de solicitud no es válida" }),
	solicitationTime: z.string({ message: "La hora de solicitud no es válida" }),
	workRequest: z.string().min(1, { message: "La solicitud no puede estar vacía" }),
	workDescription: z.string().optional(),
	priority: z.enum(WORK_ORDER_PRIORITY_VALUES_ARRAY, { message: "La prioridad no es válida" }),
	capex: z.enum(WORK_ORDER_CAPEX_VALUES_ARRAY, { message: "El indicador no es válido" }),
	equipment: z.array(z.string().nonempty({ message: "El equipo no puede estar vacío" })).min(1, {
		message: "Debe seleccionar al menos un equipo",
	}),
	programDate: z.date({ message: "La fecha de programación no es válida" }),
	estimatedHours: z.string({ message: "La hora estimada no es válida" }).refine(
		(value) => {
			const hours = parseInt(value)
			return !isNaN(hours) && hours > 0
		},
		{ message: "La hora estimada no es válida" }
	),
	estimatedDays: z.string({ message: "La cantidad de días no es válida" }).refine(
		(value) => {
			const days = parseInt(value)
			return !isNaN(days) && days > 0
		},
		{ message: "La cantidad de días no es válida" }
	),
	requiresBreak: z.boolean().optional(),
	breakDays: z.string().optional(),
	estimatedEndDate: z.date({ message: "La fecha de fin estimada no es válida" }).optional(),
	workProgressStatus: z
		.string()
		.regex(/^([0-9]|[1-9][0-9]|100)$/, { message: "El progreso debe ser un número entre 0 y 100" }),

	companyId: z.string().optional(),
	supervisorId: z.string().nonempty({ message: "El supervisor no puede estar vacío" }),
	responsibleId: z.string().nonempty({ message: "El responsable no puede estar vacío" }),
	endReport: z.array(fileSchema).optional(),
})

export type UpdateWorkOrderSchema = z.infer<typeof updateWorkOrderSchema>
