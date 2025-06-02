import { z } from "zod"

export const VEHICLE_TYPE_VALUES_ARRAY = [
	"CAR",
	"BUS",
	"TRUCK",
	"OTHER",
	"TRACTOR",
	"TRAILER",
	"MOTORCYCLE",
] as const

export const vehicleSchema = z.object({
	model: z.string().min(1, { message: "El modelo o nombre es requerido" }),
	plate: z.string().optional(),
	year: z.coerce
		.number()
		.min(1900, { message: "El año debe ser válido" })
		.max(new Date().getFullYear() + 1, {
			message: `El año no puede ser mayor a ${new Date().getFullYear() + 1}`,
		})
		.optional(),
	brand: z.string().optional(),
	type: z.enum(VEHICLE_TYPE_VALUES_ARRAY, { message: "El tipo no es válido" }),
	color: z.string().optional(),
	isMain: z.boolean().default(false),
})

export type VehicleSchema = z.infer<typeof vehicleSchema>

export const updateVehicleSchema = vehicleSchema.extend({
	id: z.string().min(1, { message: "El ID del vehículo es requerido" }),
})

export type UpdateVehicleSchema = z.infer<typeof updateVehicleSchema>
