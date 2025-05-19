import { z } from "zod"

import { WORK_ORDER_PRIORITY_VALUES_ARRAY } from "@/lib/consts/work-order-priority"
import { WORK_ORDER_CAPEX_VALUES_ARRAY } from "@/lib/consts/work-order-capex"
import { WORK_ORDER_TYPE_VALUES_ARRAY } from "@/lib/consts/work-order-types"

export const workOrderSchemaByTask = z.object({
	type: z.enum(WORK_ORDER_TYPE_VALUES_ARRAY, { message: "El tipo no es válido" }),
	solicitationDate: z.date().optional(),
	solicitationTime: z.string().optional(),
	workRequest: z.string().min(1, { message: "La solicitud no puede estar vacía" }),
	workDescription: z.string().optional(),
	priority: z.enum(WORK_ORDER_PRIORITY_VALUES_ARRAY, { message: "La prioridad no es válida" }),
	capex: z.enum(WORK_ORDER_CAPEX_VALUES_ARRAY, { message: "El indicador no es válido" }),
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

	companyId: z.string().nonempty({ message: "La empresa no puede estar vacía" }),
	supervisorId: z.string().nonempty({ message: "El supervisor no puede estar vacío" }),
	responsibleId: z.string().nonempty({ message: "El responsable no puede estar vacío" }),
})

export type WorkOrderSchemaByTask = z.infer<typeof workOrderSchemaByTask>
