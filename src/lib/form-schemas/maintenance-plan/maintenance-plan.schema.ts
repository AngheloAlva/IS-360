import { z } from "zod"

import { PLAN_LOCATION_VALUES_ARRAY } from "@/lib/consts/plan-location"

export const maintenancePlanSchema = z.object({
	name: z.string({ message: "El nombre es requerido" }),
	location: z.enum(PLAN_LOCATION_VALUES_ARRAY, { message: "La ubicación es requerida" }),
	equipmentId: z.string({ message: "El equipo es requerido" }),
	createdById: z.string(),
})

export type MaintenancePlanSchema = z.infer<typeof maintenancePlanSchema>
