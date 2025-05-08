import {
	WorkerDocumentType,
	CompanyDocumentType,
	VehicleDocumentType,
	EnvironmentalDocType,
} from "@prisma/client"

export const DOCUMENT_TYPES = {
	company: {
		COMPANY_FILE: CompanyDocumentType.COMPANY_FILE,
		MUTUAL_AGREEMENT: CompanyDocumentType.MUTUAL_AGREEMENT,
		REGULATIONS: CompanyDocumentType.REGULATIONS,
		ORGANIZATION_CHART: CompanyDocumentType.ORGANIZATION_CHART,
		PREVENTION_PLAN: CompanyDocumentType.PREVENTION_PLAN,
		OTHER: CompanyDocumentType.OTHER,
	},
	// Tipos de documentos de trabajadores
	worker: {
		ID_CARD: WorkerDocumentType.ID_CARD,
		CONTRACT: WorkerDocumentType.CONTRACT,
		SOCIAL_SECURITY: WorkerDocumentType.SOCIAL_SECURITY,
		HEALTH_EXAM: WorkerDocumentType.HEALTH_EXAM,
		TRAINING_CERT: WorkerDocumentType.TRAINING_CERT,
		OTHER: WorkerDocumentType.OTHER,
	},
	// Tipos de documentos de vehículos
	vehicle: {
		REGISTRATION: VehicleDocumentType.REGISTRATION,
		TECHNICAL_REVIEW: VehicleDocumentType.TECHNICAL_REVIEW,
		INSURANCE: VehicleDocumentType.INSURANCE,
		DRIVER_LICENSE: VehicleDocumentType.DRIVER_LICENSE,
		OTHER: VehicleDocumentType.OTHER,
	},
	// Tipos de documentos ambientales
	environmental: {
		WASTE_MANAGEMENT: EnvironmentalDocType.WASTE_MANAGEMENT,
		SPILL_CONTROL: EnvironmentalDocType.SPILL_CONTROL,
		ENVIRONMENTAL_PERMIT: EnvironmentalDocType.ENVIRONMENTAL_PERMIT,
		CHEMICAL_HANDLING: EnvironmentalDocType.CHEMICAL_HANDLING,
		OTHER: EnvironmentalDocType.OTHER,
	},
}

export const GENERAL_STARTUP_FOLDER_STRUCTURE = {
	companyManagement: {
		title: "Gestión de la Empresa",
		documents: [
			{
				type: DOCUMENT_TYPES.company.COMPANY_FILE,
				name: "Ficha empresa",
				fileType: "FILE",
				required: true,
			},
			{
				type: DOCUMENT_TYPES.company.MUTUAL_AGREEMENT,
				name: "Mutualidad",
				fileType: "FILE",
				required: true,
			},
			{
				type: DOCUMENT_TYPES.company.REGULATIONS,
				name: "Reglamento interno de orden, higiene y seguridad",
				fileType: "FILE",
				required: true,
			},
			{
				type: DOCUMENT_TYPES.company.ORGANIZATION_CHART,
				name: "Organigrama",
				fileType: "FILE",
				required: true,
			},
			{
				type: DOCUMENT_TYPES.company.OTHER,
				name: "Resolución sanitaria",
				fileType: "FILE",
				required: false,
			},
			{
				type: DOCUMENT_TYPES.company.PREVENTION_PLAN,
				name: "Plan de prevención",
				fileType: "FILE",
				required: true,
			},
		],
	},

	equipmentAndTools: {
		title: "Equipos y Herramientas",
		documents: [
			{
				type: DOCUMENT_TYPES.company.OTHER,
				name: "Herramientas eléctricas",
				required: false,
				fileType: "FILE",
			},
			{
				type: DOCUMENT_TYPES.company.OTHER,
				name: "Extintores",
				required: true,
				fileType: "FILE",
			},
		],
	},

	programs: {
		title: "Programas",
		documents: [
			{
				type: DOCUMENT_TYPES.company.OTHER,
				name: "Programa de trabajo",
				required: true,
				fileType: "FILE",
			},
			{
				type: DOCUMENT_TYPES.company.OTHER,
				name: "Programa de capacitación",
				required: true,
				fileType: "FILE",
			},
			{
				type: DOCUMENT_TYPES.company.OTHER,
				name: "Cronograma de trabajo",
				required: true,
				fileType: "FILE",
			},
		],
	},

	evaluationsAndMatrices: {
		title: "Evaluaciones y Matrices Generales",
		documents: [
			{
				type: DOCUMENT_TYPES.company.OTHER,
				name: "Matriz de identificación de peligros y evaluación de riesgos (IPER)",
				required: true,
				fileType: "FILE",
			},
			{
				type: DOCUMENT_TYPES.company.OTHER,
				name: "Evaluación inicial de condiciones",
				required: true,
				fileType: "FILE",
			},
		],
	},

	safetyAndEmergencies: {
		title: "Seguridad y Emergencias",
		documents: [
			{
				type: DOCUMENT_TYPES.company.OTHER,
				name: "Plan de emergencia y evacuación",
				required: true,
				fileType: "FILE",
			},
			{
				type: DOCUMENT_TYPES.company.OTHER,
				name: "Hojas de seguridad de productos químicos",
				required: false,
				fileType: "FILE",
			},
			{
				type: DOCUMENT_TYPES.company.OTHER,
				name: "Listado de EPP y EPP entregados",
				required: true,
				fileType: "FILE",
			},
		],
	},
}

export const WORK_ORDER_STARTUP_FOLDER_STRUCTURE = {
	assignedPersonnel: {
		title: "Personal Asignado",
		documentType: "worker",
		documents: [
			{
				type: DOCUMENT_TYPES.worker.OTHER,
				name: "Documentos personales de trabajadores (CV, certificados)",
				required: true,
				fileType: "FILE",
			},
			{
				type: DOCUMENT_TYPES.worker.CONTRACT,
				name: "Contratos",
				required: true,
				fileType: "FILE",
			},
			{
				type: DOCUMENT_TYPES.worker.OTHER,
				name: "Registros de inducción",
				required: true,
				fileType: "FILE",
			},
			{
				type: DOCUMENT_TYPES.worker.OTHER,
				name: "Ficha de trabajadores",
				required: true,
				fileType: "FILE",
			},
		],
	},

	vehiclesAndEquipment: {
		title: "Vehículos y Equipos",
		documentType: "vehicle",
		documents: [
			{
				type: DOCUMENT_TYPES.vehicle.OTHER,
				name: "Vehículos asignados al trabajo (padrón, revisión técnica, seguro)",
				required: true,
				fileType: "FILE",
			},
			{
				type: DOCUMENT_TYPES.vehicle.OTHER,
				name: "Equipos/máquinas con documentación técnica",
				required: false,
				fileType: "FILE",
			},
		],
	},

	specificProcedures: {
		title: "Procedimientos Específicos",
		documentType: "procedure",
		documents: [
			{
				name: "Procedimientos de trabajo seguro",
				description: "Documento requerido para el trabajo",
				required: true,
				fileType: "FILE",
			},
			{
				name: "Permisos de trabajo (en caso de aplicar)",
				description: "Documento opcional para el trabajo",
				required: false,
				fileType: "FILE",
			},
		],
	},

	environment: {
		title: "Medio Ambiente",
		documentType: "environmental",
		documents: [
			{
				type: DOCUMENT_TYPES.environmental.ENVIRONMENTAL_PERMIT,
				name: "Evaluación de impacto ambiental (si aplica)",
				required: false,
				fileType: "FILE",
			},
			{
				type: DOCUMENT_TYPES.environmental.OTHER,
				name: "Medidas de mitigación ambiental",
				required: true,
				fileType: "FILE",
			},
			{
				type: DOCUMENT_TYPES.environmental.WASTE_MANAGEMENT,
				name: "Gestión de residuos",
				required: true,
				fileType: "FILE",
			},
		],
	},

	occupationalHealthAndSafety: {
		title: "Seguridad y Salud en el Trabajo",
		documentType: "procedure",
		documents: [
			{
				name: "IPER específica del trabajo",
				description: "Documento requerido para el trabajo",
				required: true,
				fileType: "FILE",
			},
			{
				name: "Análisis de riesgos de tareas críticas",
				description: "Documento requerido para el trabajo",
				required: true,
				fileType: "FILE",
			},
			{
				name: "Informes médicos u otros exámenes requeridos",
				description: "Documento opcional para el trabajo",
				required: false,
				fileType: "FILE",
			},
		],
	},
}
