import { z } from "zod"

export const preventionAreaSchema = z.object({
	workBookId: z.string(),

	name: z.string().min(1, "Name is required").nonempty(),
	others: z.string().optional(),
	recommendations: z.string().optional(),
	initialDate: z.date(),
	initialTime: z
		.string()
		.regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: "Debe ingresar una hora válida" }),
	comments: z.string().optional(),
})
