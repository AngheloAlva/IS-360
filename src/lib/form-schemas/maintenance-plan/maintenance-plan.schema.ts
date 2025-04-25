import { z } from "zod"

import { PLAN_LOCATION_VALUES_ARRAY } from "@/lib/consts/plan-location"

export const maintenancePlanSchema = z.object({
	name: z.string({ message: "El nombre es requerido" }),
	description: z.string().min(1, { message: "La descripción no puede estar vacía" }),
	location: z.enum(PLAN_LOCATION_VALUES_ARRAY, { message: "La ubicación es requerida" }),
	equipmentId: z.string({ message: "El equipo es requerido" }),
	createdById: z.string(),
})

export type MaintenancePlanSchema = z.infer<typeof maintenancePlanSchema>
