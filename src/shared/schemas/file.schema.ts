import { z } from "zod"

export const fileSchema = z.object({
	file: z.instanceof(File).optional(),
	url: z.string(),
	preview: z.string(),
	type: z.string(),
	title: z.string(),
	fileSize: z.number(),
	mimeType: z.string().optional(),
})

export type FileSchema = z.infer<typeof fileSchema>
