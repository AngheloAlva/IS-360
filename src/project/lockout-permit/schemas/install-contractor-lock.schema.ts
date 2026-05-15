import { z } from "zod"

export const installContractorLockSchema = z.object({
	lockoutPermitId: z.string().min(1, "El ID del permiso de bloqueo es requerido"),
	contractorLockNumber: z.string().min(1, "El número de candado del contratista es requerido"),
})

export type InstallContractorLockSchema = z.infer<typeof installContractorLockSchema>
