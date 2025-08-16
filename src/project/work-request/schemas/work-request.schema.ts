import { z } from "zod"

import { fileSchema } from "@/shared/schemas/file.schema"
import { WORK_REQUEST_TYPE } from "@prisma/client"

export const workRequestSchema = z.object({
	description: z.string().min(1, { message: "La descripción no puede estar vacía" }),
	isUrgent: z.boolean().default(false).optional(),
	requestDate: z.date({ message: "La fecha de solicitud no es válida" }),
	observations: z.string().optional(),
	attachments: z.array(fileSchema).optional(),
	workType: z.nativeEnum(WORK_REQUEST_TYPE).optional(),
	equipments: z.string().nonempty({ message: "El equipo no puede estar vacío" }).min(1, {
		message: "Debe seleccionar al menos un equipo",
	}),
	operatorId: z.string().optional(),
})

export type WorkRequestSchema = z.infer<typeof workRequestSchema>
