import { z } from "zod"

export const createLocationSchema = z.object({
	name: z.string().min(1, { message: "El nombre es requerido" }).trim(),
	parentId: z.string().nullable(),
})

export const updateLocationSchema = z.object({
	id: z.string(),
	name: z.string().min(1, { message: "El nombre es requerido" }).trim().optional(),
	parentId: z.string().nullable().optional(),
})

export const deleteLocationSchema = z.object({
	id: z.string(),
})

export const reassignEquipmentLocationSchema = z.object({
	equipmentId: z.string(),
	locationId: z.string(),
})

export type CreateLocationInput = z.infer<typeof createLocationSchema>
export type UpdateLocationInput = z.infer<typeof updateLocationSchema>
export type DeleteLocationInput = z.infer<typeof deleteLocationSchema>
export type ReassignEquipmentLocationInput = z.infer<typeof reassignEquipmentLocationSchema>
