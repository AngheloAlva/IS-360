import { fileSchema } from "@/shared/schemas/file.schema"
import { z } from "zod"

export const workPermitAttachmentSchema = z.object({
	userId: z.string(),
	companyId: z.string(),
	workPermitId: z.string(),
	file: z.array(fileSchema).min(1, { message: "Se requiere al menos un archivo" }),
})

export type WorkPermitAttachmentSchema = z.infer<typeof workPermitAttachmentSchema>
