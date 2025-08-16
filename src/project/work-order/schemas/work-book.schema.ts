import { z } from "zod"

export const workBookSchema = z.object({
	userId: z.string().nonempty(),
	workOrderId: z.string().nonempty({ message: "Debe seleccionar un número de OT" }),
	workBookLocation: z.string().optional(),
	workBookStartDate: z.date({ message: "La fecha de inicio no es válida" }),
	workBookName: z.string().nonempty({ message: "El nombre de la obra no puede estar vacío" }),
})

export type WorkBookSchema = z.infer<typeof workBookSchema>
