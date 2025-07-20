import {
	DocumentCategory,
	EnvironmentDocType,
	EnvironmentalDocType,
	TechSpecsDocumentType,
	SafetyAndHealthDocumentType,
} from "@prisma/client"

export interface StartupFolderStructure {
	title: string
	description: string
	category: DocumentCategory
	documents: {
		name: string
		description?: string
		type:
			| SafetyAndHealthDocumentType
			| EnvironmentalDocType
			| TechSpecsDocumentType
			| EnvironmentDocType
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
			type: EnvironmentalDocType.OTHER,
			name: "Otros documenots",
			description:
				"Otros documentos solicitados por el área de medio ambiente, en reunión inicial.",
		},
	],
}

export const ENVIRONMENT_STRUCTURE: StartupFolderStructure = {
	title: "Medio Ambiente",
	category: DocumentCategory.ENVIRONMENT,
	description: "Documentación medio ambiental obligatoria según normativa OTC.",
	documents: [
		{
			type: EnvironmentDocType.WORK_PROCEDURE,
			name: "Procedimiento de trabajo",
			description: "Procedimiento de trabajo que incluya apartado de medio ambiente",
		},
		{
			type: EnvironmentDocType.ENVIRONMENTAL_ASPECTS_AND_IMPACTS_MATRIX,
			name: "Matriz de Aspecto e Impactos Ambientales",
			description: "Matriz de Aspecto e Impactos Ambientales",
		},
		{
			type: EnvironmentDocType.SAFETY_DATA_SHEET_FOR_CHEMICALS,
			name: "Hoja de seguridad de productos químicos",
			description: "Hoja de seguridad de productos químicos a utilizar (en caso que aplique)",
		},
		{
			type: EnvironmentDocType.WORKER_TRAINING_RECORD,
			name: "Programa de capacitación en materia ambiental",
			description:
				"Registro de capacitación a trabajadores de Matriz de aspectos ambientales y procedimiento",
		},
		{
			type: EnvironmentDocType.HEALTH_RESOLUTION_FOR_WORKERS_DRINKING_WATER,
			name: "Resolución sanitaria del agua de consumo de trabajadores",
			description: "Resolución sanitaria del agua de consumo de trabajadores",
		},
		{
			type: EnvironmentDocType.HEALTH_RESOLUTION_FOR_THE_CHEMICAL_TOILET,
			name: "Resolución sanitaria del baño químico a utilizar en instalaciones",
			description: "Resolución sanitaria del baño químico a utilizar en instalaciones",
		},
		{
			type: EnvironmentDocType.RESOLUTION_FOR_THE_SITE_WHERE_DEBRIS_WILL_BE_DISPOSED,
			name: "Resolución del sitio donde se dispondran escombros",
			description: "Resolución del sitio donde se dispondran escombros (en caso de aplicar)",
		},
		{
			type: EnvironmentDocType.RESOLUTION_FOR_THE_DEBRIS_TRANSPORTER,
			name: "Resolución del transportista de escombros",
			description: "Resolución del transportista de escombros (en caso de aplicar)",
		},
		{
			type: EnvironmentDocType.DEBRIS_TRANSFER_ROUTE,
			name: "Ruta de Traslado de escombros",
			description: "Ruta de Traslado de escombros (en caso de aplicar)",
		},
	],
}

export const EXTENDED_ENVIRONMENT_STRUCTURE: StartupFolderStructure = {
	title: "Medio Ambiente",
	category: DocumentCategory.ENVIRONMENT,
	description: "Documentación medio ambiental obligatoria según normativa OTC.",
	documents: [
		...ENVIRONMENT_STRUCTURE.documents,
		{
			type: EnvironmentDocType.HEALTH_RESOLUTION_FROM_THE_PEST_CONTROL_COMPANY,
			name: "Resolucion sanitaria de la empresa de control de plagas",
			description:
				"Resolucion sanitaria de la empresa de control de plagas que desinfectará y desratizará instalaciones de faena",
		},
		{
			type: EnvironmentDocType.ENVIRONMENTAL_MANAGEMENT_PLAN,
			name: "Plan de Gestión Ambiental",
			description: "Plan de Gestión Ambiental",
		},
	],
}

export const TECH_SPEC_STRUCTURE: StartupFolderStructure = {
	title: "Documentación técnica",
	category: DocumentCategory.TECHNICAL_SPECS,
	description: "Documentación técnica obligatoria de equipos y vehículos asignados al proyecto.",
	documents: [
		{
			type: TechSpecsDocumentType.GANTT_CHART,
			name: "Carta Gantt",
			description: "Cronograma del proyecto y planificación de actividades.",
		},
		{
			type: TechSpecsDocumentType.TECHNICAL_WORK_PROCEDURE,
			name: "Procedimiento de trabajo técnico",
			description: "Procedimiento de trabajo técnico.",
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
		default:
			return {
				title: "",
				documentTypes: [],
			}
	}
}

export const getDocumentsByCategory = (category: DocumentCategory, moreMonthDuration: boolean) => {
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
		case DocumentCategory.ENVIRONMENT:
			return {
				title: moreMonthDuration
					? EXTENDED_ENVIRONMENT_STRUCTURE.title
					: ENVIRONMENT_STRUCTURE.title,
				documents: moreMonthDuration
					? EXTENDED_ENVIRONMENT_STRUCTURE.documents
					: ENVIRONMENT_STRUCTURE.documents,
				category: DocumentCategory.ENVIRONMENT,
			}
		case DocumentCategory.TECHNICAL_SPECS:
			return {
				title: TECH_SPEC_STRUCTURE.title,
				documents: TECH_SPEC_STRUCTURE.documents,
				category: DocumentCategory.TECHNICAL_SPECS,
			}
		default:
			return {
				title: "",
				documents: [],
			}
	}
}
