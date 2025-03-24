import { WorkOrderPriorityKeys } from "@/lib/consts/work-order-priority"
import { WorkOrderStatusKeys } from "@/lib/consts/work-order-status"
import { WorkOrderTypeKeys } from "@/lib/consts/work-order-types"
import { z } from "zod"

export const workOrderSchema = z.object({
	type: z.enum(WorkOrderTypeKeys, { message: "El tipo no es válido" }),
	status: z.enum(WorkOrderStatusKeys, { message: "El estado no es válido" }).default("PENDING"),
	solicitationDate: z.date({ message: "La fecha de solicitud no es válida" }),
	solicitationTime: z.string({ message: "La hora de solicitud no es válida" }),
	workRequest: z.string().min(1, { message: "La solicitud no puede estar vacía" }),
	workDescription: z.string().optional(),
	priority: z.enum(WorkOrderPriorityKeys, { message: "La prioridad no es válida" }),
	// equipment: z.array(z.string(), { message: "El equipo no es válido" }),
	equipment: z.string().nonempty({ message: "El equipo no puede estar vacío" }),
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

export type WorkOrderSchema = z.infer<typeof workOrderSchema>
