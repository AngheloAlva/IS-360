import { z } from "zod"

import { AreasValuesArray } from "@/lib/consts/areas"

export const fileSchema = z.object({
	file: z.instanceof(File),
	url: z.string(),
	preview: z.string(),
	type: z.string(),
	title: z.string(),
	fileSize: z.number(),
	mimeType: z.string(),
})

export const fileFormSchema = z.object({
	userId: z.string(),
	folderSlug: z.string().optional(),
	area: z.enum(AreasValuesArray, { message: "El área es requerido" }),
	code: z.string({ message: "El código es requerido" }),
	otherCode: z.string().optional(),
	registrationDate: z.date({ message: "La fecha de registro es requerida" }),
	expirationDate: z.date().optional(),
	name: z.string().optional(),
	description: z.string().optional(),
	files: z.array(fileSchema).min(1, { message: "Se requiere al menos un archivo" }),
})

export type FileFormSchema = z.infer<typeof fileFormSchema>
export type FileSchema = z.infer<typeof fileSchema>
