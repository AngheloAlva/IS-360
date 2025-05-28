import { z } from "zod"

import { rutRegex } from "../../rutRegex"
import { VEHICLE_TYPE_ARRAY } from "@/lib/consts/vehicle-type"

export const companySchema = z.object({
	name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
	rut: z.string().regex(rutRegex, { message: "El RUT no es válido" }),

	vehicles: z
		.array(
			z.object({
				plate: z.string().min(4, { message: "La placa debe tener al menos 4 caracteres" }),
				model: z.string().min(2, { message: "El modelo debe tener al menos 2 caracteres" }),
				year: z
					.string()
					.min(4, { message: "El año debe tener 4 caracteres" })
					.refine((value) => parseInt(value) >= 2000, {
						message: "El año debe ser mayor o igual a 2000",
					}),
				brand: z.string().min(2, { message: "La marca debe tener al menos 2 caracteres" }),
				type: z.enum(VEHICLE_TYPE_ARRAY),
				color: z.string().optional(),
				isMain: z.boolean().optional(),
			})
		)
		.optional(),

	supervisors: z
		.array(
			z.object({
				name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
				email: z.string().email({ message: "El correo electrónico debe ser válido" }),
				rut: z.string().regex(rutRegex, { message: "El RUT no es válido" }),
				phone: z.string().optional(),
				internalArea: z.string().optional(),
				internalRole: z.string().optional(),
				isSupervisor: z.boolean().optional(),
			})
		)
		.optional(),
})

export type CompanySchema = z.infer<typeof companySchema>
