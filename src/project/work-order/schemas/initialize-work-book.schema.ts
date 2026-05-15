import { z } from "zod"

export const initializeWorkBookSchema = z.object({
	workBookName: z.string().nonempty({ message: "El nombre de la obra no puede estar vacío" }),
	workBookStartDate: z.date({ message: "La fecha de inicio no es válida" }),
	workBookLocation: z.string().optional(),
})

export type InitializeWorkBookSchema = z.infer<typeof initializeWorkBookSchema>
