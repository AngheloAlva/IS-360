import {
	DocumentCategory,
	WorkerDocumentType,
	VehicleDocumentType,
	EnvironmentalDocType,
	SafetyAndHealthDocumentType,
} from "@prisma/client"

export interface StartupFolderStructure {
	title: string
	description: string
	category: DocumentCategory
	documents: {
		name: string
		required: boolean
		description?: string
		type:
			| SafetyAndHealthDocumentType
			| VehicleDocumentType
			| WorkerDocumentType
			| EnvironmentalDocType
	}[]
}

export const SAFETY_AND_HEALTH_STRUCTURE: StartupFolderStructure = {
	title: "Seguridad y Salud Ocupacional",
	category: DocumentCategory.SAFETY_AND_HEALTH,
	description: "Documentación relacionada con seguridad y salud ocupacional.",
	documents: [
		{
			type: SafetyAndHealthDocumentType.COMPANY_INFO,
			name: "Ficha empresa",
			required: true,
			description: "Información básica de la empresa y sus responsables",
		},
		{
			type: SafetyAndHealthDocumentType.STAFF_LIST,
			name: "Nómina de personal",
			required: true,
			description: "Lista del personal que trabajará en OTC",
		},
		{
			type: SafetyAndHealthDocumentType.GANTT_CHART,
			name: "Carta Gantt",
			required: true,
			description: "Cronograma detallado del proyecto",
		},
		{
			type: SafetyAndHealthDocumentType.MUTUAL,
			name: "Certificado de adhesión a mutualidad",
			required: true,
			description: "Comprobante de afiliación a mutualidad",
		},
		{
			type: SafetyAndHealthDocumentType.INTERNAL_REGULATION,
			name: "Reglamento interno",
			required: true,
			description: "Reglamento interno de orden, higiene y seguridad",
		},
		{
			type: SafetyAndHealthDocumentType.ACCIDENT_RATE,
			name: "Certificado de siniestralidad",
			required: true,
			description: "Tasa de siniestralidad laboral del último año",
		},
		{
			type: SafetyAndHealthDocumentType.RISK_MATRIX,
			name: "Matriz de Identificación de peligros",
			required: true,
			description: "Matriz de evaluación de riesgos",
		},
		{
			type: SafetyAndHealthDocumentType.PREVENTION_PLAN,
			name: "Plan de Prevención de Riesgos",
			required: true,
			description: "Plan de medidas preventivas",
		},
		{
			type: SafetyAndHealthDocumentType.WORK_PROCEDURE,
			name: "Procedimiento de Trabajo",
			required: true,
			description: "Procedimientos de trabajo específicos",
		},
		{
			type: SafetyAndHealthDocumentType.EMERGENCY_PROCEDURE,
			name: "Procedimiento de Emergencia",
			required: true,
			description: "Protocolos para emergencias",
		},
		{
			type: SafetyAndHealthDocumentType.TOOLS_MAINTENANCE,
			name: "Programa de mantención",
			required: true,
			description: "Mantención de herramientas y equipos",
		},
		{
			type: SafetyAndHealthDocumentType.PPE_CERTIFICATION,
			name: "Certificación de EPP",
			required: true,
			description: "Certificados de elementos de protección personal",
		},
		{
			type: SafetyAndHealthDocumentType.HARASSMENT_PROCEDURE,
			name: "Procedimiento de Acoso",
			required: true,
			description: "Procedimiento para acoso laboral y sexual",
		},
		{
			type: SafetyAndHealthDocumentType.ORGANIZATION_CHART,
			name: "Organigrama",
			required: true,
			description: "Estructura organizacional del proyecto",
		},
		{
			type: SafetyAndHealthDocumentType.SAFE_WORK,
			name: "Trabajo seguro",
			required: true,
			description: "Procedimientos de trabajo seguro",
		},
		{
			type: SafetyAndHealthDocumentType.RISK_ANALYSIS,
			name: "Análisis de riesgos",
			required: true,
			description: "Análisis detallado de riesgos",
		},
		{
			type: SafetyAndHealthDocumentType.WORK_PERMIT,
			name: "Permiso de trabajo",
			required: true,
			description: "Autorización para realizar trabajos",
		},
	],
}

export const ENVIRONMENTAL_STRUCTURE: StartupFolderStructure = {
	title: "Medio Ambiente",
	category: DocumentCategory.ENVIRONMENTAL,
	description: "Documentación relacionada con gestión ambiental y manejo de residuos.",
	documents: [
		{
			type: EnvironmentalDocType.ENVIRONMENTAL_PLAN,
			name: "Plan de Gestión ambiental",
			required: true,
			description: "Plan que detalla las medidas para protección del medio ambiente",
		},
		{
			type: EnvironmentalDocType.SPILL_PREVENTION,
			name: "Procedimiento de Prevención y control de derrames",
			required: true,
			description: "Procedimiento para prevenir y controlar derrames",
		},
		{
			type: EnvironmentalDocType.WASTE_MANAGEMENT,
			name: "Procedimiento de manejo de residuos",
			required: true,
			description: "Procedimiento para el manejo y disposición de residuos",
		},
		{
			type: EnvironmentalDocType.ENVIRONMENTAL_TRAINING,
			name: "Capacitaciones ambientales",
			required: true,
			description: "Registros de capacitaciones en temas ambientales",
		},
		{
			type: EnvironmentalDocType.ENVIRONMENTAL_MATRIX,
			name: "Matriz de identificación y evaluación de aspectos ambientales",
			required: true,
			description: "Matriz de evaluación de impactos ambientales",
		},
		{
			type: EnvironmentalDocType.RECT_CERTIFICATE,
			name: "Certificado RECT",
			required: true,
			description: "Certificado de registro en sistemas de declaración de residuos",
		},
		{
			type: EnvironmentalDocType.WATER_CERTIFICATE,
			name: "Certificado compra de agua potable",
			required: true,
			description: "Comprobante de adquisición de agua potable",
		},
		{
			type: EnvironmentalDocType.WATER_FACTORY_RESOLUTION,
			name: "Resolución sanitaria fábrica de botellones de agua",
			required: false,
			description: "Autorización sanitaria para fábrica de agua",
		},
		{
			type: EnvironmentalDocType.DINING_RESOLUTION,
			name: "Resolución sanitaria comedor",
			required: false,
			description: "Autorización sanitaria para comedor",
		},
		{
			type: EnvironmentalDocType.CHEMICAL_TOILET_CONTRACT,
			name: "Contrato servicio de limpieza de baños químicos",
			required: true,
			description: "Contrato vigente para servicio de baños químicos",
		},
		{
			type: EnvironmentalDocType.SAFETY_DATA_SHEET,
			name: "Hojas de datos de seguridad de sustancias químicas",
			required: true,
			description: "Hojas de seguridad de productos químicos",
		},
		{
			type: EnvironmentalDocType.LAYOUT_PLAN,
			name: "Plano layout de instalación de faenas",
			required: true,
			description: "Plano de distribución de instalaciones",
		},
		{
			type: EnvironmentalDocType.ELECTRICAL_DECLARATION,
			name: "TE 1, Declaración de instalación eléctrica",
			required: false,
			description: "Declaración de instalaciones eléctricas",
		},
		{
			type: EnvironmentalDocType.GAS_DECLARATION,
			name: "TC 6, Declaración de instalaciones interiores de gas",
			required: false,
			description: "Declaración de instalaciones de gas",
		},
		{
			type: EnvironmentalDocType.PEST_CONTROL_RESOLUTION,
			name: "Resolución sanitaria de control de plagas",
			required: false,
			description: "Autorización para control de plagas",
		},
		{
			type: EnvironmentalDocType.PEST_CONTROL_CERTIFICATE,
			name: "Certificado mensual de desratización, desinsectación y sanitización",
			required: false,
			description: "Certificado de control de plagas",
		},
		{
			type: EnvironmentalDocType.HAZARDOUS_STORAGE_CHECKLIST,
			name: "Check list de Bodega de almacenamiento",
			required: false,
			description: "Lista de verificación de bodega de sustancias peligrosas",
		},
		{
			type: EnvironmentalDocType.HAZARDOUS_INVENTORY,
			name: "Inventario mensual de sustancias peligrosas",
			required: false,
			description: "Registro de sustancias peligrosas almacenadas",
		},
		{
			type: EnvironmentalDocType.FUEL_CONSUMPTION,
			name: "Planilla de registro de consumo de combustible",
			required: false,
			description: "Registro de consumo de combustible",
		},
		{
			type: EnvironmentalDocType.WATER_CONSUMPTION,
			name: "Planilla de registro mensual de consumo de agua",
			required: false,
			description: "Registro de consumo de agua",
		},
	],
}

export const VEHICLE_STRUCTURE: StartupFolderStructure = {
	title: "Vehículos y Equipos",
	category: DocumentCategory.VEHICLES,
	description: "Documentación de vehículos y equipos.",
	documents: [
		{
			type: VehicleDocumentType.EQUIPMENT_FILE,
			name: "Ficha de equipos",
			required: true,
			description: "Documentación técnica del equipo o vehículo",
		},
		{
			type: VehicleDocumentType.VEHICLE_REGISTRATION,
			name: "Inscripción del vehículo motorizado (Padrón)",
			required: true,
			description: "Documento de inscripción oficial del vehículo",
		},
		{
			type: VehicleDocumentType.CIRCULATION_PERMIT,
			name: "Permiso de circulación",
			required: true,
			description: "Permiso de circulación vigente",
		},
		{
			type: VehicleDocumentType.TECHNICAL_REVIEW,
			name: "Revisión técnica",
			required: true,
			description: "Revisión técnica vigente",
		},
		{
			type: VehicleDocumentType.INSURANCE,
			name: "Seguro obligatorio",
			required: true,
			description: "Seguro obligatorio vigente",
		},
		{
			type: VehicleDocumentType.CHECKLIST,
			name: "Lista de chequeo previa al ingreso",
			required: true,
			description: "Verificación de condiciones del vehículo antes de ingresar",
		},
		{
			type: VehicleDocumentType.HAZARDOUS_WASTE_TRANSPORT,
			name: "Resolución sanitaria para transporte de residuos peligrosos",
			required: false,
			description: "Autorización para transportar residuos peligrosos",
		},
		{
			type: VehicleDocumentType.NON_HAZARDOUS_WASTE_TRANSPORT,
			name: "Resolución sanitaria para transporte de residuos No peligrosos",
			required: false,
			description: "Autorización para transportar residuos no peligrosos",
		},
		{
			type: VehicleDocumentType.LIQUID_WASTE_TRANSPORT,
			name: "Resolución sanitaria para transporte de residuos domésticos líquidos",
			required: false,
			description: "Autorización para transportar residuos líquidos",
		},
	],
}

export const WORKER_STRUCTURE: StartupFolderStructure = {
	title: "Personal",
	description: "Documentos de personal",
	category: DocumentCategory.PERSONNEL,
	documents: [
		{
			type: WorkerDocumentType.CONTRACT,
			name: "Contrato de Trabajo",
			required: true,
			description: "Contrato de trabajo vigente",
		},
		{
			type: WorkerDocumentType.INTERNAL_REGULATION_RECEIPT,
			name: "Entrega de Reglamento Interno",
			required: true,
			description: "Comprobante de entrega del reglamento interno",
		},
		{
			type: WorkerDocumentType.RISK_INFORMATION,
			name: "Inducción de Riesgos Laborales (IRL)",
			required: true,
			description: "Certificado de inducción en riesgos laborales",
		},
		{
			type: WorkerDocumentType.ID_CARD,
			name: "Cédula de identidad",
			required: true,
			description: "Documento de identidad vigente",
		},
		{
			type: WorkerDocumentType.DRIVING_LICENSE,
			name: "Licencias de conducir",
			required: true,
			description: "Licencia de conducir vigente según el tipo de vehículo",
		},
		{
			type: WorkerDocumentType.HEALTH_EXAM,
			name: "Examen médico vigente",
			required: true,
			description: "Certificado médico de aptitud laboral",
		},
		{
			type: WorkerDocumentType.PSYCHOTECHNICAL_EXAM,
			name: "Examen Psico sensotécnico",
			required: true,
			description: "Evaluación psicotécnica vigente",
		},
		{
			type: WorkerDocumentType.RISK_MATRIX_TRAINING,
			name: "Capacitación de la matriz de identificación de peligros",
			required: true,
			description: "Certificado de capacitación en matriz de riesgos",
		},
		{
			type: WorkerDocumentType.WORK_PROCEDURE_TRAINING,
			name: "Capacitación del procedimiento de trabajo",
			required: true,
			description: "Certificado de capacitación en procedimientos de trabajo",
		},
		{
			type: WorkerDocumentType.EMERGENCY_PROCEDURE_TRAINING,
			name: "Capacitación del Procedimiento de Emergencia",
			required: true,
			description: "Certificado de capacitación en procedimientos de emergencia",
		},
		{
			type: WorkerDocumentType.DEFENSIVE_DRIVING_TRAINING,
			name: "Capacitación curso manejo defensivo",
			required: true,
			description: "Certificado de curso de manejo defensivo",
		},
		{
			type: WorkerDocumentType.MOUNTAIN_DEFENSIVE_DRIVING,
			name: "Curso de manejo defensivo en alta montaña",
			required: true,
			description: "Certificado de curso de manejo en alta montaña",
		},
		{
			type: WorkerDocumentType.TOOLS_MAINTENANCE_TRAINING,
			name: "Capacitación del procedimiento de Mantención de Herramientas",
			required: true,
			description: "Certificado de capacitación en mantención de herramientas",
		},
		{
			type: WorkerDocumentType.HARASSMENT_TRAINING,
			name: "Capacitación de la Ley Karin",
			required: true,
			description: "Certificado de capacitación en Ley Karin",
		},
		{
			type: WorkerDocumentType.PPE_RECEIPT,
			name: "Entrega de Elementos de Protección personal",
			required: true,
			description: "Comprobante de entrega de EPP",
		},
		{
			type: WorkerDocumentType.PREVENTION_EXPERT,
			name: "Experto en Prevención de riesgos",
			required: true,
			description: "Certificación como experto en prevención",
		},
		{
			type: WorkerDocumentType.HIGH_RISK_TRAINING,
			name: "Cursos para trabajos de alto riesgo",
			required: true,
			description: "Certificados de capacitación en trabajos de alto riesgo",
		},
		{
			type: WorkerDocumentType.ENVIRONMENTAL_TRAINING,
			name: "Capacitaciones ambientales",
			required: true,
			description: "Certificados de capacitación ambiental",
		},
	],
}

export function getDocumentTypesByCategory(category: DocumentCategory) {
	switch (category) {
		case DocumentCategory.SAFETY_AND_HEALTH:
			return {
				title: SAFETY_AND_HEALTH_STRUCTURE.title,
				documentTypes: SAFETY_AND_HEALTH_STRUCTURE.documents,
			}
		case DocumentCategory.ENVIRONMENTAL:
			return {
				title: ENVIRONMENTAL_STRUCTURE.title,
				documentTypes: ENVIRONMENTAL_STRUCTURE.documents,
			}
		case DocumentCategory.VEHICLES:
			return {
				title: VEHICLE_STRUCTURE.title,
				documentTypes: VEHICLE_STRUCTURE.documents,
			}
		case DocumentCategory.PERSONNEL:
			return {
				title: WORKER_STRUCTURE.title,
				documentTypes: WORKER_STRUCTURE.documents,
			}
		default:
			return {
				title: "",
				documentTypes: [],
			}
	}
}

export const getDocumentsByCategory = (category: DocumentCategory) => {
	switch (category) {
		case DocumentCategory.SAFETY_AND_HEALTH:
			return {
				title: SAFETY_AND_HEALTH_STRUCTURE.title,
				documents: SAFETY_AND_HEALTH_STRUCTURE.documents,
				category: DocumentCategory.SAFETY_AND_HEALTH,
			}
		case DocumentCategory.ENVIRONMENTAL:
			return {
				title: ENVIRONMENTAL_STRUCTURE.title,
				documents: ENVIRONMENTAL_STRUCTURE.documents,
				category: DocumentCategory.ENVIRONMENTAL,
			}
		case DocumentCategory.VEHICLES:
			return {
				title: VEHICLE_STRUCTURE.title,
				documents: VEHICLE_STRUCTURE.documents,
				category: DocumentCategory.VEHICLES,
			}
		case DocumentCategory.PERSONNEL:
			return {
				title: WORKER_STRUCTURE.title,
				documents: WORKER_STRUCTURE.documents,
				category: DocumentCategory.PERSONNEL,
			}
		default:
			return {
				title: "",
				documents: [],
			}
	}
}
