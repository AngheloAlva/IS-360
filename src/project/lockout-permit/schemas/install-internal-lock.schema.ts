import { z } from "zod"

export const installInternalLockSchema = z.object({
	lockoutPermitId: z.string().min(1, "El ID del registro es requerido"),
	internalOperatorId: z.string().min(1, "Debe seleccionar un operador interno"),
	internalLockNumber: z.string().min(1, "El número de candado interno es requerido"),
})

export type InstallInternalLockSchema = z.infer<typeof installInternalLockSchema>
