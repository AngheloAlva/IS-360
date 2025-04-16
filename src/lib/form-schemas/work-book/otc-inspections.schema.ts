import { z } from "zod"

export const otcInspectionsSchema = z.object({
	workOrderId: z.string(),

	executionDate: z.date({ message: "La fecha de ejecución no es válida" }),
	activityStartTime: z.string().nonempty({ message: "La hora de inicio no puede estar vacía" }),
	activityEndTime: z.string().nonempty({ message: "La hora de fin no puede estar vacía" }),
	supervisionComments: z
		.string()
		.nonempty({ message: "Los comentarios de supervisión no pueden estar vacíos" }),
	safetyObservations: z
		.string()
		.nonempty({ message: "Las observaciones de seguridad no pueden estar vacías" }),
	nonConformities: z.string().optional(),
	progress: z
		.string()
		.regex(/^[0-9]+$/, "Debe ser un número")
		.optional(),
})

export type OtcInspectionSchema = z.infer<typeof otcInspectionsSchema>
