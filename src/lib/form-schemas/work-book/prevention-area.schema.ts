import { z } from "zod"

export const preventionAreaSchema = z.object({
	workBookId: z.string(),

	name: z.string().min(1, "Name is required").nonempty(),
	others: z.string().optional(),
	recommendations: z.string().optional(),
})
