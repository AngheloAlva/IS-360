import { z } from "zod"

export const aditionalActivitySchema = z.object({
	workOrderId: z.string(),

	comments: z.string().optional(),
	executionDate: z.date({ message: "La fecha de ejecución no es válida" }),
	activityStartTime: z.string().nonempty({ message: "La hora de inicio no puede estar vacía" }),
	activityEndTime: z.string().nonempty({ message: "La hora de fin no puede estar vacía" }),
	activityName: z.string().nonempty({ message: "El nombre de la actividad no puede estar vacío" }),
})

export type AditionalActivitySchema = z.infer<typeof aditionalActivitySchema>
