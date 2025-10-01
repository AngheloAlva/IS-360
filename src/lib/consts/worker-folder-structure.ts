import { DocumentCategory, WorkerDocumentType } from "@prisma/client"

export interface WorkerFolderStructure {
	title: string
	description: string
	documents: {
		name: string
		description?: string
		type: WorkerDocumentType
	}[]
}

export const BASE_WORKER_STRUCTURE: WorkerFolderStructure = {
	title: "Personal",
	description: "Documentación individual obligatoria para trabajadores que ingresen a IS 360.",
	documents: [
		{
			type: WorkerDocumentType.CONTRACT,
			name: "Contrato de trabajo",
			description: "Contrato vigente, incluyendo anexos según corresponda.",
		},
		{
			type: WorkerDocumentType.INTERNAL_REGULATION_RECEIPT,
			name: "Entrega del reglamento interno",
			description: "Comprobante de recepción de la última versión del reglamento.",
		},
		{
			type: WorkerDocumentType.RISK_INFORMATION,
			name: "Inducción de Riesgos Laborales (IRL)",
			description: "Documento completo con los contenidos mínimos del DS 44.",
		},
		{
			type: WorkerDocumentType.ID_CARD,
			name: "Cédula de identidad",
			description: "Fotocopia por ambos lados del documento de identidad.",
		},
		{
			type: WorkerDocumentType.HEALTH_EXAM,
			name: "Examen médico vigente",
			description: "Emitido por OAL según batería exigida por IS 360.",
		},
		{
			type: WorkerDocumentType.RISK_MATRIX_TRAINING,
			name: "Capacitación MIPER",
			description: "Registro de capacitación sobre la matriz de peligros presentada.",
		},
		{
			type: WorkerDocumentType.WORK_PROCEDURE_TRAINING,
			name: "Capacitación en procedimientos de trabajo",
			description: "Registro de capacitación de los procedimientos presentados a IS 360.",
		},
		{
			type: WorkerDocumentType.EMERGENCY_PROCEDURE_TRAINING,
			name: "Capacitación en procedimientos de emergencia",
			description: "Capacitación sobre respuesta ante incidentes y accidentes.",
		},
		{
			type: WorkerDocumentType.TOOLS_MAINTENANCE_TRAINING,
			name: "Capacitación en mantención de herramientas",
			description: "Registro de capacitación del procedimiento de mantención.",
		},
		{
			type: WorkerDocumentType.HARASSMENT_TRAINING,
			name: "Capacitación en Ley Karin",
			description: "Registro de capacitación del procedimiento contra acoso.",
		},
		{
			type: WorkerDocumentType.PPE_RECEIPT,
			name: "Entrega de EPP",
			description: "Registro de entrega de elementos de protección personal.",
		},
		{
			type: WorkerDocumentType.PREVENTION_EXPERT,
			name: "Experto en prevención de riesgos",
			description: "Resolución sanitaria, carné y CV del experto, si aplica.",
		},
		{
			type: WorkerDocumentType.HIGH_RISK_TRAINING,
			name: "Capacitación en trabajos de alto riesgo",
			description: "Certificados de cursos en altura, espacios confinados, etc.",
		},
	],
}

export const DRIVER_WORKER_STRUCTURE: WorkerFolderStructure = {
	title: "Personal",
	description: "Documentación individual obligatoria para conductores que ingresen a IS 360.",
	documents: [
		...BASE_WORKER_STRUCTURE.documents,
		{
			type: WorkerDocumentType.DRIVING_LICENSE,
			name: "Licencia de conducir",
			description: "Licencia vigente por ambos lados (si aplica).",
		},
		{
			type: WorkerDocumentType.PSYCHOTECHNICAL_EXAM,
			name: "Examen psicosensotécnico",
			description: "Requerido si el trabajador posee licencia profesional.",
		},
		{
			type: WorkerDocumentType.DEFENSIVE_DRIVING_TRAINING,
			name: "Curso de manejo defensivo",
			description: "Solo para quienes desempeñan labores de conducción.",
		},
		{
			type: WorkerDocumentType.MOUNTAIN_DEFENSIVE_DRIVING,
			name: "Curso de manejo en alta montaña",
			description: "Para quienes transiten hacia Buta Mallín o zonas cordilleranas.",
		},
		{
			type: WorkerDocumentType.ALCOHOL_AND_DRUGS_EXAM,
			name: "Examen de alcohol y drogas",
			description: "Examen de alcohol y drogas.",
		},
	],
}

export const getDocumentsByWorkerIsDriver = (category: DocumentCategory, isDriver?: boolean) => {
	switch (category) {
		case DocumentCategory.PERSONNEL:
			return {
				title: BASE_WORKER_STRUCTURE.title,
				documents: isDriver ? DRIVER_WORKER_STRUCTURE.documents : BASE_WORKER_STRUCTURE.documents,
				category: DocumentCategory.PERSONNEL,
			}
		case DocumentCategory.BASIC:
			return {
				title: BASE_WORKER_STRUCTURE.title,
				documents: BASE_WORKER_STRUCTURE.documents,
				category: DocumentCategory.BASIC,
			}
		default:
			return {
				title: "",
				documents: [],
			}
	}
}
