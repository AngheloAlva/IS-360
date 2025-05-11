import {
	WorkerDocumentType,
	CompanyDocumentType,
	VehicleDocumentType,
	EnvironmentalDocType,
	DocumentSubcategory,
} from "@prisma/client"

export const DOCUMENT_TYPES = {
	// Documentos para carpeta general de empresa
	company: {
		// Información Básica
		COMPANY_INFO: CompanyDocumentType.COMPANY_INFO,
		STAFF_LIST: CompanyDocumentType.STAFF_LIST,
		GANTT_CHART: CompanyDocumentType.GANTT_CHART,
		MUTUAL: CompanyDocumentType.MUTUAL,
		INTERNAL_REGULATION: CompanyDocumentType.INTERNAL_REGULATION,
		ACCIDENT_RATE: CompanyDocumentType.ACCIDENT_RATE,

		// Procedimientos y Otros
		RISK_MATRIX: CompanyDocumentType.RISK_MATRIX,
		PREVENTION_PLAN: CompanyDocumentType.PREVENTION_PLAN,
		WORK_PROCEDURE: CompanyDocumentType.WORK_PROCEDURE,
		EMERGENCY_PROCEDURE: CompanyDocumentType.EMERGENCY_PROCEDURE,
		TOOLS_MAINTENANCE: CompanyDocumentType.TOOLS_MAINTENANCE,
		PPE_CERTIFICATION: CompanyDocumentType.PPE_CERTIFICATION,
		HARASSMENT_PROCEDURE: CompanyDocumentType.HARASSMENT_PROCEDURE,
		ORGANIZATION_CHART: CompanyDocumentType.ORGANIZATION_CHART,

		OTHER: CompanyDocumentType.OTHER,
	},

	// Tipos de documentos de trabajadores
	worker: {
		ID_CARD: WorkerDocumentType.ID_CARD,
		CONTRACT: WorkerDocumentType.CONTRACT,
		INTERNAL_REGULATION_RECEIPT: WorkerDocumentType.INTERNAL_REGULATION_RECEIPT,
		RISK_INFORMATION: WorkerDocumentType.RISK_INFORMATION,
		DRIVING_LICENSE: WorkerDocumentType.DRIVING_LICENSE,
		HEALTH_EXAM: WorkerDocumentType.HEALTH_EXAM,
		PSYCHOTECHNICAL_EXAM: WorkerDocumentType.PSYCHOTECHNICAL_EXAM,
		RISK_MATRIX_TRAINING: WorkerDocumentType.RISK_MATRIX_TRAINING,
		WORK_PROCEDURE_TRAINING: WorkerDocumentType.WORK_PROCEDURE_TRAINING,
		EMERGENCY_PROCEDURE_TRAINING: WorkerDocumentType.EMERGENCY_PROCEDURE_TRAINING,
		DEFENSIVE_DRIVING_TRAINING: WorkerDocumentType.DEFENSIVE_DRIVING_TRAINING,
		MOUNTAIN_DEFENSIVE_DRIVING: WorkerDocumentType.MOUNTAIN_DEFENSIVE_DRIVING,
		TOOLS_MAINTENANCE_TRAINING: WorkerDocumentType.TOOLS_MAINTENANCE_TRAINING,
		HARASSMENT_TRAINING: WorkerDocumentType.HARASSMENT_TRAINING,
		PPE_RECEIPT: WorkerDocumentType.PPE_RECEIPT,
		PREVENTION_EXPERT: WorkerDocumentType.PREVENTION_EXPERT,
		HIGH_RISK_TRAINING: WorkerDocumentType.HIGH_RISK_TRAINING,
		ENVIRONMENTAL_TRAINING: WorkerDocumentType.ENVIRONMENTAL_TRAINING,
		OTHER: WorkerDocumentType.OTHER,
	},

	// Tipos de documentos de vehículos
	vehicle: {
		EQUIPMENT_FILE: VehicleDocumentType.EQUIPMENT_FILE,
		VEHICLE_REGISTRATION: VehicleDocumentType.VEHICLE_REGISTRATION,
		CIRCULATION_PERMIT: VehicleDocumentType.CIRCULATION_PERMIT,
		TECHNICAL_REVIEW: VehicleDocumentType.TECHNICAL_REVIEW,
		INSURANCE: VehicleDocumentType.INSURANCE,
		CHECKLIST: VehicleDocumentType.CHECKLIST,
		HAZARDOUS_WASTE_TRANSPORT: VehicleDocumentType.HAZARDOUS_WASTE_TRANSPORT,
		NON_HAZARDOUS_WASTE_TRANSPORT: VehicleDocumentType.NON_HAZARDOUS_WASTE_TRANSPORT,
		LIQUID_WASTE_TRANSPORT: VehicleDocumentType.LIQUID_WASTE_TRANSPORT,
		OTHER: VehicleDocumentType.OTHER,
	},

	// Tipos de documentos ambientales
	environmental: {
		ENVIRONMENTAL_PLAN: EnvironmentalDocType.ENVIRONMENTAL_PLAN,
		SPILL_PREVENTION: EnvironmentalDocType.SPILL_PREVENTION,
		WASTE_MANAGEMENT: EnvironmentalDocType.WASTE_MANAGEMENT,
		ENVIRONMENTAL_MATRIX: EnvironmentalDocType.ENVIRONMENTAL_MATRIX,
		RECT_CERTIFICATE: EnvironmentalDocType.RECT_CERTIFICATE,
		WATER_CERTIFICATE: EnvironmentalDocType.WATER_CERTIFICATE,
		WATER_FACTORY_RESOLUTION: EnvironmentalDocType.WATER_FACTORY_RESOLUTION,
		DINING_RESOLUTION: EnvironmentalDocType.DINING_RESOLUTION,
		CHEMICAL_TOILET_CONTRACT: EnvironmentalDocType.CHEMICAL_TOILET_CONTRACT,
		SAFETY_DATA_SHEET: EnvironmentalDocType.SAFETY_DATA_SHEET,
		LAYOUT_PLAN: EnvironmentalDocType.LAYOUT_PLAN,
		ELECTRICAL_DECLARATION: EnvironmentalDocType.ELECTRICAL_DECLARATION,
		GAS_DECLARATION: EnvironmentalDocType.GAS_DECLARATION,
		PEST_CONTROL_RESOLUTION: EnvironmentalDocType.PEST_CONTROL_RESOLUTION,
		PEST_CONTROL_CERTIFICATE: EnvironmentalDocType.PEST_CONTROL_CERTIFICATE,
		HAZARDOUS_STORAGE_CHECKLIST: EnvironmentalDocType.HAZARDOUS_STORAGE_CHECKLIST,
		HAZARDOUS_INVENTORY: EnvironmentalDocType.HAZARDOUS_INVENTORY,
		FUEL_CONSUMPTION: EnvironmentalDocType.FUEL_CONSUMPTION,
		WATER_CONSUMPTION: EnvironmentalDocType.WATER_CONSUMPTION,
		OTHER: EnvironmentalDocType.OTHER,
	},
}

export const GENERAL_STARTUP_FOLDER_STRUCTURE = {
	basicInfo: {
		title: "Información Básica",
		subcategory: DocumentSubcategory.BASIC_INFO,
		documents: [
			{
				type: DOCUMENT_TYPES.company.COMPANY_INFO,
				name: "Ficha empresa",
				fileType: "FILE",
				required: true,
			},
			{
				type: DOCUMENT_TYPES.company.STAFF_LIST,
				name: "Nómina de personal",
				fileType: "FILE",
				required: true,
			},
			{
				type: DOCUMENT_TYPES.company.GANTT_CHART,
				name: "Carta Gantt del proyecto y planificación",
				fileType: "FILE",
				required: true,
			},
			{
				type: DOCUMENT_TYPES.company.MUTUAL,
				name: "Certificado de adhesión a mutualidad",
				fileType: "FILE",
				required: true,
			},
			{
				type: DOCUMENT_TYPES.company.INTERNAL_REGULATION,
				name: "Reglamento interno de orden, higiene y seguridad",
				fileType: "FILE",
				required: true,
			},
			{
				type: DOCUMENT_TYPES.company.ACCIDENT_RATE,
				name: "Certificado de siniestralidad de mutualidad (1 año)",
				fileType: "FILE",
				required: true,
			},
		],
	},

	procedures: {
		title: "Procedimientos y Otros",
		subcategory: DocumentSubcategory.PROCEDURES,
		documents: [
			{
				type: DOCUMENT_TYPES.company.RISK_MATRIX,
				name: "Matriz de Identificación de peligros y evaluación de Riesgos",
				fileType: "FILE",
				required: true,
			},
			{
				type: DOCUMENT_TYPES.company.PREVENTION_PLAN,
				name: "Plan de Prevención de riesgos",
				fileType: "FILE",
				required: true,
			},
			{
				type: DOCUMENT_TYPES.company.WORK_PROCEDURE,
				name: "Procedimiento de trabajos a ejecutar",
				fileType: "FILE",
				required: true,
			},
			{
				type: DOCUMENT_TYPES.company.EMERGENCY_PROCEDURE,
				name: "Procedimientos de Emergencia y Acciones Por Seguir ante un Incidente",
				fileType: "FILE",
				required: true,
			},
			{
				type: DOCUMENT_TYPES.company.TOOLS_MAINTENANCE,
				name: "Programa de Mantención de Herramientas y Equipos",
				fileType: "FILE",
				required: true,
			},
			{
				type: DOCUMENT_TYPES.company.PPE_CERTIFICATION,
				name: "Certificación de elementos de Protección Personal",
				fileType: "FILE",
				required: true,
			},
			{
				type: DOCUMENT_TYPES.company.HARASSMENT_PROCEDURE,
				name: "Procedimiento de Acoso Laboral, Sexual y Violencia en el Trabajo",
				fileType: "FILE",
				required: true,
			},
			{
				type: DOCUMENT_TYPES.company.ORGANIZATION_CHART,
				name: "Organigrama de la Empresa",
				fileType: "FILE",
				required: true,
			},
		],
	},
}

export const WORK_ORDER_STARTUP_FOLDER_STRUCTURE = {
	// Subcarpeta "Vehículos y Equipos"
	vehiclesAndEquipment: {
		title: "Vehículos y Equipos",
		subcategory: DocumentSubcategory.VEHICLES,
		documentType: "vehicle",
		documents: [
			{
				type: DOCUMENT_TYPES.vehicle.EQUIPMENT_FILE,
				name: "Ficha de equipos",
				required: true,
				fileType: "FILE",
			},
			{
				type: DOCUMENT_TYPES.vehicle.VEHICLE_REGISTRATION,
				name: "Inscripción del Vehículo Motorizado (Padrón)",
				required: true,
				fileType: "FILE",
			},
			{
				type: DOCUMENT_TYPES.vehicle.CIRCULATION_PERMIT,
				name: "Permiso de circulación",
				required: true,
				fileType: "FILE",
			},
			{
				type: DOCUMENT_TYPES.vehicle.TECHNICAL_REVIEW,
				name: "Revisión técnica",
				required: true,
				fileType: "FILE",
			},
			{
				type: DOCUMENT_TYPES.vehicle.INSURANCE,
				name: "Seguro Obligatorio",
				required: true,
				fileType: "FILE",
			},
			{
				type: DOCUMENT_TYPES.vehicle.CHECKLIST,
				name: "Lista de chequeo previa al ingreso a OTC",
				required: true,
				fileType: "FILE",
			},
		],
	},

	// Subcarpeta "Procedimientos Específicos"
	specificProcedures: {
		title: "Procedimientos Específicos",
		subcategory: DocumentSubcategory.PROCEDURES,
		documentType: "procedure",
		documents: [
			{
				name: "Procedimientos de trabajo seguro",
				description: "Documento requerido para el trabajo",
				required: true,
				fileType: "FILE",
			},
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
				name: "Permisos de trabajo (en caso de aplicar)",
				description: "Documento opcional para el trabajo",
				required: false,
				fileType: "FILE",
			},
		],
	},

	// Subcarpeta "Medio Ambiente"
	environment: {
		title: "Medio Ambiente",
		subcategory: DocumentSubcategory.ENVIRONMENTAL,
		documentType: "environmental",
		documents: [
			{
				type: DOCUMENT_TYPES.environmental.ENVIRONMENTAL_PLAN,
				name: "Plan de Gestión ambiental para trabajos en OTC",
				required: true,
				fileType: "FILE",
			},
			{
				type: DOCUMENT_TYPES.environmental.SPILL_PREVENTION,
				name: "Procedimiento de Prevención y control de derrames",
				required: true,
				fileType: "FILE",
			},
			{
				type: DOCUMENT_TYPES.environmental.WASTE_MANAGEMENT,
				name: "Procedimiento de manejo de residuos",
				required: true,
				fileType: "FILE",
			},
			{
				type: DOCUMENT_TYPES.environmental.ENVIRONMENTAL_MATRIX,
				name: "Matriz de identificación y evaluación de aspectos e impactos ambientales",
				required: true,
				fileType: "FILE",
			},
			{
				type: DOCUMENT_TYPES.environmental.SAFETY_DATA_SHEET,
				name: "Hojas de datos de seguridad de sustancias químicas",
				required: false,
				fileType: "FILE",
			},
		],
	},
}

export const WORK_ORDER_WORKER_STARTUP_FOLDER_STRUCTURE = {
	workerDocumentation: {
		title: "Documentación Personal",
		subcategory: DocumentSubcategory.PERSONNEL,
		documentType: "worker",
		documents: [
			{
				type: DOCUMENT_TYPES.worker.CONTRACT,
				name: "Contratos de Trabajo",
				required: true,
				fileType: "FILE",
			},
			{
				type: DOCUMENT_TYPES.worker.INTERNAL_REGULATION_RECEIPT,
				name: "Entrega de Reglamento Interno",
				required: true,
				fileType: "FILE",
			},
			{
				type: DOCUMENT_TYPES.worker.RISK_INFORMATION,
				name: "Inducción de Riesgos Laborales (IRL)",
				required: true,
				fileType: "FILE",
			},
			{
				type: DOCUMENT_TYPES.worker.ID_CARD,
				name: "Cédula de identidad",
				required: true,
				fileType: "FILE",
			},
			{
				type: DOCUMENT_TYPES.worker.DRIVING_LICENSE,
				name: "Licencias de conducir",
				required: false,
				fileType: "FILE",
			},
			{
				type: DOCUMENT_TYPES.worker.HEALTH_EXAM,
				name: "Examen médico vigente",
				required: true,
				fileType: "FILE",
			},
			{
				type: DOCUMENT_TYPES.worker.PSYCHOTECHNICAL_EXAM,
				name: "Examen Psico sensotécnico",
				required: false,
				fileType: "FILE",
			},
			{
				type: DOCUMENT_TYPES.worker.RISK_MATRIX_TRAINING,
				name: "Registro de capacitación matriz de riesgos",
				required: true,
				fileType: "FILE",
			},
			{
				type: DOCUMENT_TYPES.worker.WORK_PROCEDURE_TRAINING,
				name: "Registro de capacitación procedimiento de trabajo",
				required: true,
				fileType: "FILE",
			},
			{
				type: DOCUMENT_TYPES.worker.EMERGENCY_PROCEDURE_TRAINING,
				name: "Registro de capacitación procedimiento de emergencia",
				required: true,
				fileType: "FILE",
			},
			{
				type: DOCUMENT_TYPES.worker.PPE_RECEIPT,
				name: "Registro de entrega de Elementos de Protección personal",
				required: true,
				fileType: "FILE",
			},
			{
				type: DOCUMENT_TYPES.worker.PREVENTION_EXPERT,
				name: "Experto en Prevención de riesgos",
				required: false,
				fileType: "FILE",
			},
		],
	},
}
