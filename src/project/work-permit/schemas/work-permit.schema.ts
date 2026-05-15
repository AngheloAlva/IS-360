import { z } from "zod"

const baseWorkPermitSchema = {
	aplicantPt: z
		.string()
		.min(3, { message: "El nombre del postulante debe tener al menos 3 caracteres" }),
	isUrgent: z.boolean().optional(),
	mutuality: z.string().nonempty({ message: "Debe seleccionar una mutualidad" }),
	otherMutuality: z.string().optional(),
	exactPlace: z.string().nonempty({ message: "Debe ingresar un lugar exacto" }),
	workWillBe: z.string().nonempty({ message: "Debe ingresar un lugar exacto" }),
	workWillBeOther: z.string().optional(),
	tools: z.array(z.string()).min(1, { message: "Debe seleccionar al menos una herramienta" }),
	otherTools: z.string().optional(),
	preChecks: z.array(z.string()).min(1, { message: "Debe seleccionar al menos un pre-check" }),
	otherPreChecks: z.string().optional(),
	generateWaste: z.boolean(),
	wasteType: z.string().optional(),
	wasteDisposalLocation: z.string().optional(),
	otherWasteDisposalLocation: z.string().optional(),
	additionalObservations: z.string().optional(),
	startDate: z.date(),
	endDate: z.date(),
	activityDetails: z
		.array(
			z.object({
				activity: z.string().min(1, "La actividad es requerida"),
				peligros: z.array(z.string()).min(1, "Debe seleccionar al menos un peligro"),
				riesgos: z.array(z.string()).min(1, "Debe seleccionar al menos un riesgo"),
				medidasDeControl: z.array(z.string()).min(1, "Debe seleccionar al menos una medida de control"),
				otroPeligro: z.string().optional(),
				otroRiesgo: z.string().optional(),
				otraMedidaDeControl: z.string().optional(),
			})
		)
		.min(1, "Debe agregar al menos una actividad"),
	participants: z.array(
		z.object({
			userId: z.string().nonempty({ message: "Debe seleccionar un usuario" }),
		})
	),
	acceptTerms: z
		.boolean()
		.refine((value) => value, { message: "Debe aceptar los términos y condiciones" }),
}

export const createWorkPermitSchema = (isOtcMember: boolean = false) => {
	return z
		.object({
			...baseWorkPermitSchema,
			otNumber: isOtcMember
				? z.string().optional().or(z.literal(""))
				: z.string().nonempty({ message: "Debe seleccionar un número de OT" }),
		})
		.refine(
			(data) => {
				if (isOtcMember && !data.isUrgent && (!data.otNumber || data.otNumber === "")) {
					return false
				}
				if (!isOtcMember && (!data.otNumber || data.otNumber === "")) {
					return false
				}
				return true
			},
			{
				message: "Debe seleccionar un número de OT",
				path: ["otNumber"],
			}
		)
}

export const workPermitSchema = createWorkPermitSchema(false)

export type WorkPermitSchema = z.infer<ReturnType<typeof createWorkPermitSchema>>
