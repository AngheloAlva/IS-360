import { z } from "zod"

import { fileSchema } from "@/shared/schemas/file.schema"

export const otcInspectionsSchema = z.object({
	workOrderId: z.string(),
	milestoneId: z.string().optional(),

	inspectionName: z
		.string()
		.nonempty({ message: "El nombre de la inspección no puede estar vacío" }),
	executionDate: z.date({ message: "La fecha de ejecución no es válida" }),
	activityStartTime: z.string().nonempty({ message: "La hora de inicio no puede estar vacía" }),
	activityEndTime: z.string().nonempty({ message: "La hora de fin no puede estar vacía" }),
	supervisionComments: z.string().optional(),
	safetyObservations: z.string().optional(),
	nonConformities: z.string().optional(),
	files: z.array(fileSchema).optional(),
})

export type OtcInspectionSchema = z.infer<typeof otcInspectionsSchema>
