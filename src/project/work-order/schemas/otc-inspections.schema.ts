import { z } from "zod"

import { fileSchema } from "@/shared/schemas/file.schema"
import { InspectionType } from "../const/inspection-type"

export const otcInspectionsSchema = z.object({
	workOrderId: z.string(),
	milestoneId: z.string().optional(),

	inspectionName: z
		.string()
		.nonempty({ message: "El nombre de la inspección no puede estar vacío" }),
	executionDate: z.date({ message: "La fecha de ejecución no es válida" }),
	activityStartTime: z.string().nonempty({ message: "La hora de inicio no puede estar vacía" }),
	activityEndTime: z.string().nonempty({ message: "La hora de fin no puede estar vacía" }),
	files: z.array(fileSchema).optional(),
	inspections: z
		.array(
			z.object({
				type: z.enum(InspectionType),
				inspection: z.string().nonempty({ message: "Las observaciones no pueden estar vacías" }),
			})
		)
		.min(1, "Debe agregar al menos una inspección")
		.max(3, "No se puede agregar más de 3 inspecciones")
		.refine(
			(inspections) => {
				const types = inspections.map((inspection) => inspection.type)
				const uniqueTypes = new Set(types)
				return uniqueTypes.size === types.length
			},
			{
				message: "No se pueden agregar inspecciones del mismo tipo",
			}
		),

	// supervisionComments: z.string().optional(),
	// safetyObservations: z.string().optional(),
	// nonConformities: z.string().optional(),
})

export type OtcInspectionSchema = z.infer<typeof otcInspectionsSchema>
