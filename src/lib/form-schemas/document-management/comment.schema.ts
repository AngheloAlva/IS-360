import { z } from "zod"

export const commentSchema = z.object({
	fileId: z.string(),
	userId: z.string(),
	content: z.string().min(3, "El contenido debe tener al menos 3 caracteres"),
})

export type CommentSchema = z.infer<typeof commentSchema>
