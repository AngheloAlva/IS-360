import { z } from "zod"

import { rutRegex } from "../rutRegex"

export const workPermitSchema = z.object({
	userId: z.string(),

	otNumber: z.string().nonempty({ message: "Debe ingresar un número de OT" }),
	aplicantPt: z
		.string()
		.min(2, { message: "El nombre del postulante debe tener al menos 2 caracteres" }),
	responsiblePt: z
		.string()
		.min(2, { message: "El nombre del responsable debe tener al menos 2 caracteres" }),
	executanCompany: z
		.string()
		.min(2, { message: "El nombre de la empresa debe tener al menos 2 caracteres" }),
	mutuality: z.string().nonempty({ message: "Debe seleccionar una mutualidad" }),
	otherMutuality: z.string().optional(),
	initDate: z.date(),
	hour: z
		.string()
		.regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: "Debe ingresar una hora válida" }),
	workersNumber: z.string().regex(/^[0-9]*$/, { message: "Debe ingresar un número válido" }),
	workDescription: z
		.string()
		.min(10, { message: "La descripción del trabajo debe tener al menos 2 caracteres" }),
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
	whoDeliversWorkAreaOp: z
		.string()
		.min(2, { message: "El nombre del responsable debe tener al menos 2 caracteres" }),
	workerExecutor: z
		.string()
		.min(2, { message: "El nombre del trabajador debe tener al menos 2 caracteres" }),
	preventionOfficer: z
		.string()
		.nonempty({ message: "Debe seleccionar un prevencionista" }),
	whoReceives: z.string().optional(),
	cleanAndTidyWorkArea: z.boolean(),
	workCompleted: z.boolean(),
	observations: z.string().optional(),
	additionalObservations: z.string().optional(),

	participants: z.array(
		z.object({
			number: z.string().regex(/^[0-9]*$/, { message: "Debe ingresar un número válido" }),
			fullName: z
				.string()
				.min(2, { message: "El nombre completo debe tener al menos 2 caracteres" }),
			rut: z.string().regex(rutRegex, { message: "Debe ingresar un RUT válido" }),
			company: z
				.string()
				.min(2, { message: "El nombre de la empresa debe tener al menos 2 caracteres" }),
		})
	),
	acceptTerms: z
		.boolean()
		.refine((value) => value, { message: "Debe aceptar los términos y condiciones" }),
})
