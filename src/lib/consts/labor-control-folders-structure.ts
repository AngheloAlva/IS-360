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
		name: "F30_1",
		type: LABOR_CONTROL_DOCUMENT_TYPE.F30_1,
		description: "",
	},
	{
		name: "Siniestralidad",
		type: LABOR_CONTROL_DOCUMENT_TYPE.SINIESTRALITY,
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
		name: "Libro de asistencia",
		type: WORKER_LABOR_CONTROL_DOCUMENT_TYPE.ATTENDANCE_BOOK,
		description: "",
	},
	{
		name: "Licencia médica",
		type: WORKER_LABOR_CONTROL_DOCUMENT_TYPE.MEDICAL_LEAVE,
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
	{
		name: "Aviso de termino de contrato",
		type: WORKER_LABOR_CONTROL_DOCUMENT_TYPE.NOTICE_OF_TERMINATION,
		description: "",
	},
]

export const LABOR_CONTROL_DOCUMENT_TYPE_LABELS = {
	F30: "F30",
	F30_1: "F30_1",
	SINIESTRALITY: "Siniestralidad",
	TRG_TREASURY_CERTIFICATE: "TRG - Certificado Tesorería",
}

export const WORKER_LABOR_CONTROL_DOCUMENT_TYPE_LABELS = {
	ATTENDANCE_BOOK: "Libro de asistencia",
	MEDICAL_LEAVE: "Licencia médica",
	PAYROLL_STTLEMENT: "Liquidación de sueldo",
	STTLEMENT: "Finiquito",
	NOTICE_OF_TERMINATION: "Aviso de termino de contrato",
}
