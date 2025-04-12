import { z } from "zod"

import { AreasValuesArray } from "@/lib/consts/areas"

export const fileFormSchema = z.object({
	userId: z.string(),
	folderSlug: z.string().optional(),
	area: z.enum(AreasValuesArray, { message: "El área es requerido" }),

	code: z.string({ message: "El código es requerido" }),
	otherCode: z.string().optional(),
	name: z.string({ message: "El nombre es requerido" }),
	description: z.string().optional(),
	registrationDate: z.date({ message: "La fecha de registro es requerida" }),
	expirationDate: z.date().optional(),
})

export type FileFormSchema = z.infer<typeof fileFormSchema>
