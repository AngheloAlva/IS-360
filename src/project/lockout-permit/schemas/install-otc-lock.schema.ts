import { z } from "zod"

export const installOtcLockSchema = z.object({
	lockoutPermitId: z.string().min(1, "El ID del registro es requerido"),
	otcOperatorId: z.string().min(1, "Debe seleccionar un operador de OTC"),
	otcLockNumber: z.string().min(1, "El número de candado de OTC es requerido"),
})

export type InstallOtcLockSchema = z.infer<typeof installOtcLockSchema>
