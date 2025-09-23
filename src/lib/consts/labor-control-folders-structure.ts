import { LABOR_CONTROL_DOCUMENT_TYPE, WORKER_LABOR_CONTROL_DOCUMENT_TYPE } from "@prisma/client"

export interface LaborControlFolderStructure {
	name: string
	description?: string
	type: LABOR_CONTROL_DOCUMENT_TYPE
}

export interface WorkerLaborControlFolderStructure {
	name: string
	description?: string
	type: WORKER_LABOR_CONTROL_DOCUMENT_TYPE
}

export const LABOR_CONTROL_STRUCTURE: LaborControlFolderStructure[] = [
	{
		name: "F30",
		type: LABOR_CONTROL_DOCUMENT_TYPE.F30,
		description: "",
	},
	{
		name: "TRG - Certificado Tesorería",
		type: LABOR_CONTROL_DOCUMENT_TYPE.TRG_TREASURY_CERTIFICATE,
		description: "",
	},
]

export const WORKER_LABOR_CONTROL_STRUCTURE: WorkerLaborControlFolderStructure[] = [
	{
		name: "F30_1",
		type: WORKER_LABOR_CONTROL_DOCUMENT_TYPE.F30_1,
		description: "",
	},
	{
		name: "Certificado de accidentabilidad",
		type: WORKER_LABOR_CONTROL_DOCUMENT_TYPE.ACCIDENT_CERTIFICATE,
		description: "",
	},
	{
		name: "Libro de asistencia",
		type: WORKER_LABOR_CONTROL_DOCUMENT_TYPE.ATTENDANCE_BOOK,
		description: "",
	},
	{
		name: "Carta de despedida",
		type: WORKER_LABOR_CONTROL_DOCUMENT_TYPE.FAREWELL_LETTER,
		description: "",
	},
	{
		name: "Licencia médica",
		type: WORKER_LABOR_CONTROL_DOCUMENT_TYPE.MEDICAL_LEAVE,
		description: "",
	},
	{
		name: "Pago de cotizaciones previsionales",
		type: WORKER_LABOR_CONTROL_DOCUMENT_TYPE.PAYMENT_OF_PENSION_CONTRIBUTION,
		description: "",
	},
	{
		name: "Liquidación de sueldo",
		type: WORKER_LABOR_CONTROL_DOCUMENT_TYPE.PAYROLL_STTLEMENT,
		description: "",
	},
	{
		name: "Finiquito",
		type: WORKER_LABOR_CONTROL_DOCUMENT_TYPE.STTLEMENT,
		description: "",
	},
]
