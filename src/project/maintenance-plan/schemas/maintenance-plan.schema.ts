import { z } from "zod"

export const maintenancePlanSchema = z.object({
	name: z
		.string({ message: "El nombre es requerido" })
		.min(1, { message: "El nombre es requerido" }),
	equipmentId: z.string({ message: "El equipo es requerido" }),
	createdById: z.string(),
})

export type MaintenancePlanSchema = z.infer<typeof maintenancePlanSchema>
