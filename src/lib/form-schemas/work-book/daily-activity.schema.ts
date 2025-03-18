import { z } from "zod"

export const dailyActivitySchema = z.object({
	workBookId: z.string(),

	comments: z.string().nonempty({ message: "Los comentarios no pueden estar vacíos" }),
	executionDate: z.date({ message: "La fecha de ejecución no es válida" }),
	activityStartTime: z.string().nonempty({ message: "La hora de inicio no puede estar vacía" }),
	activityEndTime: z.string().nonempty({ message: "La hora de fin no puede estar vacía" }),
	activityName: z.string().nonempty({ message: "El nombre de la actividad no puede estar vacío" }),
	personnel: z
		.array(
			z.object({
				userId: z.string(),
			})
		)
		.min(1, { message: "Debe haber al menos un personal" }),
})

export type DailyActivitySchema = z.infer<typeof dailyActivitySchema>
