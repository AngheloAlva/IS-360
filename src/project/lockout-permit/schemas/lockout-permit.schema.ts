import { z } from "zod"

const activitySchema = z.object({
	activity: z.string().min(1, "La actividad no puede estar vacía"),
})

const lockoutRegistrationSchema = z.object({
	name: z.string().min(1, "El nombre es requerido"),
	rut: z.string().min(1, "El RUT es requerido"),
	lockNumber: z.string().min(1, "El número de candado es requerido"),
	installDate: z.date().optional(),
	installTime: z.string().optional(),
	removeDate: z.date().optional(),
	removeTime: z.string().optional(),
})

const zeroEnergyReviewSchema = z.object({
	action: z.string().min(1, "La acción es requerida"),
	equipment: z.string().min(1, "El equipo es requerido"),
	location: z.string().min(1, "La ubicación es requerida"),
	performedBy: z.string().min(1, "Debe especificar quién realizó la acción"),
	isZeroEnergyReview: z.boolean().optional(),
})

const baseLockoutPermitSchema = {
	lockoutType: z.enum(["PREVENTIVE", "CORRECTIVE", "EMERGENCY", "OTHER"], {
		errorMap: () => ({ message: "Debe seleccionar un tipo de bloqueo válido" }),
	}),
	lockoutTypeOther: z.string().optional(),
	startDate: z.date({ message: "Debe seleccionar una fecha de inicio" }),
	endDate: z.date({ message: "Debe seleccionar una fecha de fin" }),
	finalObservations: z.string().optional(),

	activitiesToExecute: z
		.array(activitySchema)
		.min(1, { message: "Debe especificar al menos una actividad a ejecutar" }),
	lockoutRegistrations: z.array(lockoutRegistrationSchema).optional(),
	zeroEnergyReviews: z.array(zeroEnergyReviewSchema).optional(),

	requestedById: z.string().min(1, "El solicitante es requerido"),
	areaResponsibleId: z.string().min(1, "El responsable del área es requerido"),
	otNumberId: z.string().optional(),
}

export const lockoutPermitSchema = z
	.object({
		...baseLockoutPermitSchema,
	})
	.refine(
		(data) => {
			if (data.startDate && data.endDate && data.startDate >= data.endDate) {
				return false
			}
			return true
		},
		{
			message: "La fecha de fin debe ser posterior a la fecha de inicio",
			path: ["endDate"],
		}
	)
	.refine(
		(data) => {
			if (
				data.lockoutType === "OTHER" &&
				(!data.lockoutTypeOther || data.lockoutTypeOther.trim() === "")
			) {
				return false
			}
			return true
		},
		{
			message: "Debe especificar el tipo de bloqueo cuando selecciona 'Otro'",
			path: ["lockoutTypeOther"],
		}
	)

export type LockoutPermitSchema = z.infer<typeof lockoutPermitSchema>
