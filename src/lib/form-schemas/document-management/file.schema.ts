import { Codes } from "@/lib/consts/codes"
import { z } from "zod"

export const fileFormSchema = z.object({
	userId: z.string(),
	folderId: z.string().optional(),

	code: z.enum(Codes, { message: "El código es requerido" }),
	name: z.string({ message: "El nombre es requerido" }),
	description: z.string().optional(),
	registrationDate: z.date({ message: "La fecha de registro es requerida" }),
	expirationDate: z.date().optional(),
})

export type FileFormSchema = z.infer<typeof fileFormSchema>
