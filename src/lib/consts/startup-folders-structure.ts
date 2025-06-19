import {
	DocumentCategory,
	WorkerDocumentType,
	VehicleDocumentType,
	EnvironmentalDocType,
	SafetyAndHealthDocumentType,
} from "@prisma/client"
import { BASIC_FOLDER_STRUCTURE } from "./basic-startup-folders-structure"

export interface StartupFolderStructure {
	title: string
	description: string
	category: DocumentCategory
	documents: {
		name: string
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
	description: "Documentación obligatoria para la gestión de seguridad y salud ocupacional.",
	documents: [
		{
			type: SafetyAndHealthDocumentType.COMPANY_INFO,
			name: "Ficha empresa",
			description: "Información de la empresa, responsables y contactos ante OTC.",
		},
		{
			type: SafetyAndHealthDocumentType.STAFF_LIST,
			name: "Nómina de personal",
			description: "Listado del personal asignado con contactos de emergencia y exámenes médicos.",
		},
		{
			type: SafetyAndHealthDocumentType.GANTT_CHART,
			name: "Carta Gantt",
			description: "Cronograma del proyecto y planificación de actividades.",
		},
		{
			type: SafetyAndHealthDocumentType.MUTUAL,
			name: "Certificado de adhesión a mutualidad",
			description: "Documento que acredita la afiliación a la mutual correspondiente.",
		},
		{
			type: SafetyAndHealthDocumentType.INTERNAL_REGULATION,
			name: "Reglamento interno actualizado",
			description:
				"Versión vigente del reglamento, según DS44 y Ley Karin, con comprobante de entrega.",
		},
		{
			type: SafetyAndHealthDocumentType.ACCIDENT_RATE,
			name: "Certificado de siniestralidad (1 año)",
			description: "Certificado de la mutual que indica siniestralidad del último año.",
		},
		{
			type: SafetyAndHealthDocumentType.RISK_MATRIX,
			name: "Matriz de identificación y evaluación de riesgos",
			description: "Identificación y evaluación de riesgos relacionados a las tareas en OTC.",
		},
		{
			type: SafetyAndHealthDocumentType.PREVENTION_PLAN,
			name: "Plan de Prevención de Riesgos",
			description: "Plan preventivo basado en la MIPER, específico para OTC.",
		},
		{
			type: SafetyAndHealthDocumentType.WORK_PROCEDURE,
			name: "Procedimientos de trabajo",
			description: "Procedimientos firmados, vigentes, aplicables a los trabajos en OTC.",
		},
		{
			type: SafetyAndHealthDocumentType.EMERGENCY_PROCEDURE,
			name: "Procedimiento de emergencia",
			description: "Acciones ante incidentes o accidentes en instalaciones de OTC.",
		},
		{
			type: SafetyAndHealthDocumentType.TOOLS_MAINTENANCE,
			name: "Programa de mantención de herramientas y equipos",
			description: "Mantenimiento preventivo y correctivo documentado.",
		},
		{
			type: SafetyAndHealthDocumentType.PPE_CERTIFICATION,
			name: "Certificación de EPP",
			description: "Certificados de entrega y uso de elementos de protección personal.",
		},
		{
			type: SafetyAndHealthDocumentType.HARASSMENT_PROCEDURE,
			name: "Procedimiento Ley Karin",
			description:
				"Procedimientos de denuncia e investigación en casos de acoso laboral, sexual y violencia en el trabajo, Ley 21.643. (Detallar el procedimiento de denuncia y de investigación)",
		},
	],
}

export const ENVIRONMENTAL_STRUCTURE: StartupFolderStructure = {
	title: "Medio Ambiente",
	category: DocumentCategory.ENVIRONMENTAL,
	description: "Documentación ambiental obligatoria según normativa OTC.",
	documents: [
		{
			type: EnvironmentalDocType.ENVIRONMENTAL_PLAN,
			name: "Plan de Gestión Ambiental",
			description: "Plan de gestión ambiental para trabajos en OTC.",
		},
		{
			type: EnvironmentalDocType.SPILL_PREVENTION,
			name: "Procedimiento de prevención y control de derrames",
			description: "Prevención y control de derrames según actividades en OTC.",
		},
		{
			type: EnvironmentalDocType.WASTE_MANAGEMENT,
			name: "Procedimiento de manejo de residuos",
			description:
				"Procedimiento de manejo de residuos peligrosos, no peligrosos y domiciliarios. (En caso de aplicar).",
		},
		{
			type: EnvironmentalDocType.ENVIRONMENTAL_TRAINING,
			name: "Programa de capacitación en materia ambiental",
			description: "Plan y registros de formación ambiental del personal.",
		},
		{
			type: EnvironmentalDocType.ENVIRONMENTAL_MATRIX,
			name: "Matriz de aspectos e impactos ambientales",
			description:
				"Matriz de identificación y evaluación de aspectos e impactos ambientales, en formato OTC.",
		},
		{
			type: EnvironmentalDocType.RECT_CERTIFICATE,
			name: "Certificado RECT (SIDREP/SINADER)",
			description: "Registro ambiental según perfil de la empresa.",
		},
		{
			type: EnvironmentalDocType.WATER_CERTIFICATE,
			name: "Certificado de compra de agua potable",
			description:
				"Certificado (guía o factura) de compra de agua potable, en caso de instalar faenas al interior de OTC.",
		},
		{
			type: EnvironmentalDocType.WATER_FACTORY_RESOLUTION,
			name: "Resolución sanitaria de fábrica de agua",
			description: "Resolución sanitaria fabrica (o envasado) de botellones de agua.",
		},
		{
			type: EnvironmentalDocType.DINING_RESOLUTION,
			name: "Resolución sanitaria comedor o colación",
			description: "Resolución sanitaria del lugar de alimentación del personal.",
		},
		{
			type: EnvironmentalDocType.CHEMICAL_TOILET_CONTRACT,
			name: "Contrato servicio baños químicos",
			description:
				"Contrato entre empresa prestadora de servicio de limpieza de baños químicos. en caso de instalar faenas al interior de OTC.",
		},
		{
			type: EnvironmentalDocType.SAFETY_DATA_SHEET,
			name: "Hojas de Seguridad de Sustancias Químicas",
			description:
				"Registros de capacitación de las hojas de seguridad de las sustancias o residuos peligrosos a manipular o trasportar.",
		},
		{
			type: EnvironmentalDocType.LAYOUT_PLAN,
			name: "Plano layout de instalación de faenas",
			description:
				"Plano layout de la instalación de faenas con bodegas, acopio de residuos, baños, foso de lavado camión Betonero, ubicación de extintores, zona de seguridad, vías de tránsito, Estación de Seguridad Ambiental.",
		},
		{
			type: EnvironmentalDocType.ELECTRICAL_DECLARATION,
			name: "TE1 - Declaración instalación eléctrica provisoria",
			description: "Declaración TE1 para faenas dentro o fuera de OTC.",
		},
		{
			type: EnvironmentalDocType.GAS_DECLARATION,
			name: "TC6 - Declaración instalación de gas",
			description: "Declaración instalaciones interiores de gas, si corresponde.",
		},
		{
			type: EnvironmentalDocType.PEST_CONTROL_RESOLUTION,
			name: "Resolución sanitaria control de plagas",
			description:
				"Resolución sanitaria de la empresa prestadora del servicio de aplicación de plaguicidas.",
		},
		{
			type: EnvironmentalDocType.PEST_CONTROL_CERTIFICATE,
			name: "Planilla mensual de desratización/desinsectación/sanitización",
			description:
				"Planilla de control de los servicios mensuales de desratización, desinsectación y sanitización.",
		},
		{
			type: EnvironmentalDocType.PEST_CONTROL_PRODUCTS_SDS,
			name: "HDS productos control de plagas",
			description: "HDS de los químicos utilizados usados. para control de vectores.",
		},
		{
			type: EnvironmentalDocType.PEST_CONTROL_TRACKING,
			name: "Planilla control mensual sanitización",
			description: "Registro de servicios de control de plagas.",
		},
		{
			type: EnvironmentalDocType.HAZARDOUS_STORAGE_CHECKLIST,
			name: "Check list de bodega de peligrosos",
			description: "Inspección de bodega según D.S. 43/2015.",
		},
		{
			type: EnvironmentalDocType.HAZARDOUS_INVENTORY,
			name: "Inventario mensual de sustancias peligrosas",
			description: "Inventario según artículo 14 del D.S. 43 del MINSAL.",
		},
		{
			type: EnvironmentalDocType.LAND_MOVEMENT_PERMIT,
			name: "Formulario permiso movimientos de tierra",
			description:
				"Permiso municipal para excavaciones o edificaciones preliminares, etc. En caso de aplicar.",
		},
		{
			type: EnvironmentalDocType.DEBRIS_ROUTE,
			name: "Ruta de traslado de escombros y/o tierra de excavación masiva",
			description:
				"Ruta de traslado de escombros y/o tierra de excavación masiva (enviar previo a la solicitud de permiso en la Municipalidad), en caso de que aplique.",
		},
		{
			type: EnvironmentalDocType.FUEL_CONSUMPTION,
			name: "Planilla consumo mensual de combustible",
			description: "Registro de uso de combustibles.",
		},
		{
			type: EnvironmentalDocType.WATER_CONSUMPTION,
			name: "Planilla consumo mensual de agua",
			description:
				"Planilla de registro mensual de consumo de agua para humidificación de áridos, materiales inertes, entre otros.",
		},
		{
			type: EnvironmentalDocType.WATER_CONSUMPTION,
			name: "Consumo mensual de agua potable",
			description: "Planilla mensual de consumo de agua potable.",
		},
		{
			type: EnvironmentalDocType.OTHER,
			name: "Otros documenots",
			description:
				"Otros documentos solicitados por el área de medio ambiente, en reunión inicial.",
		},
	],
}

export const VEHICLE_STRUCTURE: StartupFolderStructure = {
	title: "Vehículos y Equipos",
	category: DocumentCategory.VEHICLES,
	description: "Documentación obligatoria de equipos y vehículos asignados al proyecto.",
	documents: [
		{
			type: VehicleDocumentType.EQUIPMENT_FILE,
			name: "Ficha de equipos",
			description:
				"Archivo que contenga como mínimo tipo de vehículo, patente, año, marca, modelo, nombre de la compañía de seguro y vigencias de; revisión técnica, permiso de circulación, seguro obligatorio.",
		},
		{
			type: VehicleDocumentType.VEHICLE_REGISTRATION,
			name: "Inscripción del vehículo motorizado (Padrón)",
			description: "Fotocopia de inscripción oficial del vehículo.",
		},
		{
			type: VehicleDocumentType.CIRCULATION_PERMIT,
			name: "Permiso de circulación",
			description: "Fotocopia del Permiso de circulación vigente.",
		},
		{
			type: VehicleDocumentType.TECHNICAL_REVIEW,
			name: "Revisión técnica",
			description: "Fotocopia de la Revisión técnica vigente.",
		},
		{
			type: VehicleDocumentType.INSURANCE,
			name: "Seguro obligatorio",
			description: "Fotocopia del Seguro vigente contra accidentes.",
		},
		{
			type: VehicleDocumentType.CHECKLIST,
			name: "Lista de chequeo previa al ingreso",
			description:
				"Revisión interna firmada antes del ingreso a OTC, que asegure las perfectas condiciones previa al servicio.",
		},
		{
			type: VehicleDocumentType.TRANSPORTATION_TO_OTC,
			name: "Vehículo de transporte de trabajadores",
			description: "Documentación del vehículo de traslado al sitio de trabajo.",
		},
	],
}

export const WORKER_STRUCTURE: StartupFolderStructure = {
	title: "Personal",
	category: DocumentCategory.PERSONNEL,
	description: "Documentación individual obligatoria para trabajadores que ingresen a OTC.",
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
			type: WorkerDocumentType.DRIVING_LICENSE,
			name: "Licencia de conducir",
			description: "Licencia vigente por ambos lados (si aplica).",
		},
		{
			type: WorkerDocumentType.HEALTH_EXAM,
			name: "Examen médico vigente",
			description: "Emitido por OAL según batería exigida por OTC.",
		},
		{
			type: WorkerDocumentType.PSYCHOTECHNICAL_EXAM,
			name: "Examen psicosensotécnico",
			description: "Requerido si el trabajador posee licencia profesional.",
		},
		{
			type: WorkerDocumentType.RISK_MATRIX_TRAINING,
			name: "Capacitación MIPER",
			description: "Registro de capacitación sobre la matriz de peligros presentada.",
		},
		{
			type: WorkerDocumentType.WORK_PROCEDURE_TRAINING,
			name: "Capacitación en procedimientos de trabajo",
			description: "Registro de capacitación de los procedimientos presentados a OTC.",
		},
		{
			type: WorkerDocumentType.EMERGENCY_PROCEDURE_TRAINING,
			name: "Capacitación en procedimientos de emergencia",
			description: "Capacitación sobre respuesta ante incidentes y accidentes.",
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
		case DocumentCategory.BASIC:
			return {
				title: BASIC_FOLDER_STRUCTURE.title,
				documents: BASIC_FOLDER_STRUCTURE.documents,
				category: DocumentCategory.BASIC,
			}
		default:
			return {
				title: "",
				documents: [],
			}
	}
}
