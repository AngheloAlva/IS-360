import { z } from "zod"

export const removeLockSchema = z.object({
	lockoutRegistrationId: z.string().min(1, "El ID del registro es requerido"),
	lockType: z.enum(["otc", "contractor"], {
		error: "Debe especificar el tipo de candado",
	}),
})

export type RemoveLockSchema = z.infer<typeof removeLockSchema>
