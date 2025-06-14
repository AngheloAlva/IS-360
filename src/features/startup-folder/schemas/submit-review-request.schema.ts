import { z } from "zod"

export const submitReviewRequestSchema = z.object({
	folderId: z.string({ required_error: "El ID de la carpeta es requerido." }),
	notificationEmails: z.string().optional(),
})

export type SubmitReviewRequestSchema = z.infer<typeof submitReviewRequestSchema>
