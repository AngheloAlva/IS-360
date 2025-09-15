import { z } from "zod"

export const closeLockoutPermitSchema = z.object({
	id: z.string().min(1, { message: "ID del permiso de bloqueo es requerido" }),
})

export type CloseLockoutPermitSchema = z.infer<typeof closeLockoutPermitSchema>
