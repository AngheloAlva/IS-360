import { z } from "zod"

export const workPermitSchema = z.object({
	userId: z.string(),
	companyId: z.string(),
	otNumber: z.string().nonempty({ message: "Debe seleccionar un número de OT" }),
	aplicantPt: z
		.string()
		.min(3, { message: "El nombre del postulante debe tener al menos 3 caracteres" }),
	mutuality: z.string().nonempty({ message: "Debe seleccionar una mutualidad" }),
	otherMutuality: z.string().optional(),
	exactPlace: z.string().nonempty({ message: "Debe ingresar un lugar exacto" }),
	workWillBe: z.string().nonempty({ message: "Debe ingresar un lugar exacto" }),
	workWillBeOther: z.string().optional(),
	tools: z.array(z.string()).min(1, { message: "Debe seleccionar al menos una herramienta" }),
	otherTools: z.string().optional(),
	preChecks: z.array(z.string()).min(1, { message: "Debe seleccionar al menos un pre-check" }),
	otherPreChecks: z.string().optional(),
	activityDetails: z.array(z.object({ activity: z.string() })),
	riskIdentification: z
		.array(z.string())
		.min(1, { message: "Debe seleccionar al menos un riesgo" }),
	otherRisk: z.string().optional(),
	preventiveControlMeasures: z
		.array(z.string())
		.min(1, { message: "Debe seleccionar al menos una medida de control preventiva" }),
	otherPreventiveControlMeasures: z.string().optional(),
	generateWaste: z.boolean(),
	wasteType: z.string().optional(),
	wasteDisposalLocation: z.string().optional(),
	whoDeliversWorkAreaOp: z.string().min(2, { message: "Debe seleccionar un Operador" }),
	workerExecutor: z
		.string()
		.min(2, { message: "El nombre del ejecutor del trabajo debe tener al menos 2 caracteres" }),
	preventionOfficer: z.string().nonempty({ message: "Debe seleccionar un prevencionista" }),
	cleanAndTidyWorkArea: z.boolean(),
	workCompleted: z.boolean(),
	observations: z.string().optional(),
	additionalObservations: z.string().optional(),

	participants: z.array(
		z.object({
			userId: z.string().nonempty({ message: "Debe seleccionar un usuario" }),
		})
	),
	acceptTerms: z
		.boolean()
		.refine((value) => value, { message: "Debe aceptar los términos y condiciones" }),
})

export type WorkPermitSchema = z.infer<typeof workPermitSchema>
