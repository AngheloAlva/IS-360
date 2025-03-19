import { WorkPermitStatusKeys } from "@/lib/consts/work-permit-status"
import { z } from "zod"

export const workPermitSchema = z.object({
	userId: z.string().nonempty(),

	initDate: z.date({ message: "La fecha de inicio no es válida" }),
	endDate: z.date({ message: "La fecha de fin no es válida" }),
	quantityDays: z.string().refine(
		(value) => {
			const days = parseInt(value)
			return !isNaN(days) && days > 0
		},
		{ message: "La cantidad de días no es válida" }
	),
	equipmentParent: z.string().nonempty({ message: "El equipo padre no puede estar vacío" }),
	status: z.enum(WorkPermitStatusKeys, { message: "El estado no es válido" }),
	estimatedDuration: z.string().refine(
		(value) => {
			const duration = parseInt(value)
			return !isNaN(duration) && duration > 0
		},
		{ message: "La duración estimada no es válida" }
	),
	type: z.string().nonempty({ message: "El tipo no puede estar vacío" }),
	contractCompany: z.string().nonempty({ message: "La empresa contratante no puede estar vacía" }),
	responsibleId: z.string().nonempty({ message: "El responsable no puede estar vacío" }),
})

export type WorkPermitSchema = z.infer<typeof workPermitSchema>
