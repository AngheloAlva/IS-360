import type {
	LABOR_CONTROL_STATUS,
	LABOR_CONTROL_DOCUMENT_TYPE,
	WORKER_LABOR_CONTROL_DOCUMENT_TYPE,
} from "@prisma/client"

export interface LaborControlDocument {
	id: string
	url: string
	name: string
	updatedAt: Date
	uploadDate: Date
	uploadById: string
	reviewDate: Date | null
	reviewById: string | null
	reviewNotes: string | null
	status: LABOR_CONTROL_STATUS
	type: LABOR_CONTROL_DOCUMENT_TYPE
	reviewBy: {
		id: string
		rut: string
		name: string
		email: string
		phone: string | null
		image: string | null
	} | null
	uploadBy: {
		id: string
		rut: string
		name: string
		email: string
		phone: string | null
		image: string | null
	} | null
	folderId: string
}

export interface WorkerLaborControlDocument extends Omit<LaborControlDocument, "type"> {
	type: WORKER_LABOR_CONTROL_DOCUMENT_TYPE
}

export interface WorkerLaborControlFolder {
	id: string
	status: LABOR_CONTROL_STATUS
	worker: {
		id: string
		rut: string
		name: string
	}
}
