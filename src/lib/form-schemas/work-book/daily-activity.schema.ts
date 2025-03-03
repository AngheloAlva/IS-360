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
				name: z.string().nonempty({ message: "El nombre del personal no puede estar vacío" }),
				position: z.string().nonempty({ message: "La posición del personal no puede estar vacía" }),
			})
		)
		.min(1, { message: "Debe haber al menos un personal" }),
})
