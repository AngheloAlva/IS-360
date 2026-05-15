import { z } from "zod"

import { fileSchema } from "../../../shared/schemas/file.schema"

export const confirmActivitySchema = z.object({
	activityStartTime: z.string(),
	activityEndTime: z.string(),
	executionDate: z.date(),
	comments: z.string().optional(),
	files: z.array(fileSchema).optional(),
})

export type ConfirmActivitySchema = z.infer<typeof confirmActivitySchema>
