import z from "zod"

export const closeWorkPermitSchema = z.object({
	closedBy: z.string().min(1, "Seleccione un operador"),
})

export type CloseWorkPermitSchema = z.infer<typeof closeWorkPermitSchema>
