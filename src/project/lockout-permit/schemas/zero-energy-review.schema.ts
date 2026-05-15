import { z } from "zod"

export const zeroEnergyReviewSchema = z.object({
	lockoutPermitId: z.string().min(1, "El ID del permiso de bloqueo es requerido"),
	equipmentId: z.string().min(1, "El equipo es requerido"),
	action: z.string().min(1, "La acción es requerida"),
	location: z.string().optional(),
	reviewedZero: z.boolean(),
})

export type ZeroEnergyReviewSchema = z.infer<typeof zeroEnergyReviewSchema>
