import { z } from "zod"

export const workBookSchema = z.object({
	userId: z.string().nonempty(),
	workOrderId: z.string().nonempty({ message: "Debe seleccionar un número de OT" }),
	workLocation: z.string().optional(),
	workStartDate: z.date({ message: "La fecha de inicio no es válida" }),
	workName: z.string().nonempty({ message: "El nombre de la obra no puede estar vacío" }),
})

export type WorkBookSchema = z.infer<typeof workBookSchema>
