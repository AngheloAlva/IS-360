import { z } from "zod"

export const uploadResultSchema = z.object({
	url: z.string(),
	name: z.string(),
	type: z.string(),
	size: z.number(),
})

export type UploadResultSchema = z.infer<typeof uploadResultSchema>
