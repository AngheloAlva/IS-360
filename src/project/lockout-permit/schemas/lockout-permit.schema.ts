import { LOCKOUT_TYPE } from "@/generated/prisma/enums"
import { z } from "zod"

const lockoutActivitySchema = z.object({
	activity: z.string().min(1, "La actividad no puede estar vacía"),
})

const lockoutRecordSchema = z.object({
	userId: z.string().min(1, "Debe seleccionar un usuario"),
	contractorLockNumber: z.string().min(1, "El número de candado es requerido"),
	installDate: z.date().optional(),
	installTime: z.string().optional(),
})

export const createLockoutPermitSchema = (isInternalMember: boolean = false) => {
	return z
		.object({
			lockoutType: z.nativeEnum(LOCKOUT_TYPE, {
				error: () => ({ message: "Debe seleccionar un tipo de bloqueo válido" }),
			}),
			lockoutTypeOther: z.string().optional(),
			lockoutAreaResponsibleId: isInternalMember
				? z.string().min(1, "El responsable del área es requerido")
				: z.string().optional(),
			lockoutEquipments: z
				.array(z.string())
				.min(1, { message: "Debe seleccionar al menos un equipo" }),
			startDate: z.date({ message: "Debe seleccionar una fecha de inicio" }).optional(),
			endDate: z.date({ message: "Debe seleccionar una fecha de fin" }).optional(),
			lockoutActivities: z
				.array(lockoutActivitySchema)
				.min(1, { message: "Debe especificar al menos una actividad a ejecutar" }),
			lockoutRecords: z
				.array(lockoutRecordSchema)
				.min(1, { message: "Debe agregar al menos un registro de bloqueo" }),
			lockoutFinalObservations: z.string().optional(),
		})
		.refine(
			(data) => {
				if (
					data.lockoutType === LOCKOUT_TYPE.OTHER &&
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
}

export const lockoutPermitSchema = createLockoutPermitSchema(false)

export type LockoutPermitSchema = z.infer<ReturnType<typeof createLockoutPermitSchema>>
