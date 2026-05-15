import { z } from "zod"

export const approveLockoutPermitSchema = z.object({
	approvalNotes: z.string().optional(),
	id: z.string().min(1, { message: "ID del permiso de bloqueo es requerido" }),
	approved: z.boolean({ message: "Debe especificar si el permiso es aprobado o no" }),
})

export type ApproveLockoutPermitSchema = z.infer<typeof approveLockoutPermitSchema>
