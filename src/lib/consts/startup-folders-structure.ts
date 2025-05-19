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
			description:
				"Archivo que debe contener Nombre y Rut de la empresa, dirección, datos del representante legal y responsables.",
		},
		{
			type: SafetyAndHealthDocumentType.GANTT_CHART,
			name: "Carta Gantt del Trabajo",
			required: true,
			description: "Cronograma detallado del proyecto con sus etapas y plazos.",
		},
		{
			type: SafetyAndHealthDocumentType.MUTUAL,
			name: "Certificado de adhesión a Mutualidad",
			required: true,
			description: "Comprobante oficial de afiliación a una mutualidad de seguridad.",
		},
		{
			type: SafetyAndHealthDocumentType.INTERNAL_REGULATION,
			name: "Reglamento Interno de orden higiene y seguridad",
			required: true,
			description:
				"Reglamento actualizado según DS 44 y ley Karin, con comprobante de presentación a la Dirección del Trabajo.",
		},
		{
			type: SafetyAndHealthDocumentType.ACCIDENT_RATE,
			name: "Certificado de siniestralidad de mutualidad (1 año)",
			required: true,
			description: "Certificado que muestra la tasa de siniestralidad laboral del último año.",
		},
		{
			type: SafetyAndHealthDocumentType.ORGANIZATION_CHART,
			name: "Organigrama de la Empresa",
			required: true,
			description: "Estructura jerárquica y organizacional de la empresa.",
		},
		{
			type: SafetyAndHealthDocumentType.RISK_MATRIX,
			name: "Matriz de Identificación de peligros y evaluación de Riesgos",
			required: true,
			description:
				"Documento que identifica los peligros y evalúa los riesgos asociados a las actividades en OTC.",
		},
		{
			type: SafetyAndHealthDocumentType.PREVENTION_PLAN,
			name: "Plan de Prevención de Riesgos",
			required: true,
			description: "Plan detallado de medidas preventivas concordante con la matriz de riesgos.",
		},
		{
			type: SafetyAndHealthDocumentType.WORK_PROCEDURE,
			name: "Procedimiento de Trabajo",
			required: true,
			description:
				"Procedimientos específicos para trabajos que se realizarán en OTC, con antigüedad no mayor a un año.",
		},
		{
			type: SafetyAndHealthDocumentType.EMERGENCY_PROCEDURE,
			name: "Procedimiento de Emergencia",
			required: true,
			description: "Protocolos a seguir en caso de emergencias, incidentes o accidentes.",
		},
		{
			type: SafetyAndHealthDocumentType.TOOLS_MAINTENANCE,
			name: "Programa de mantención de herramientas y equipos",
			required: true,
			description: "Plan de mantenimiento preventivo y correctivo para herramientas y equipos.",
		},
		{
			type: SafetyAndHealthDocumentType.PPE_CERTIFICATION,
			name: "Certificación de EPP",
			required: true,
			description: "Certificados que garantizan la calidad y seguridad de los EPP utilizados.",
		},
		{
			type: SafetyAndHealthDocumentType.HARASSMENT_PROCEDURE,
			name: "Procedimiento de Acoso Laboral, Sexual y Violencia en el Trabajo",
			required: true,
			description:
				"Procedimiento según Ley N°21.643 (Ley Karin) con detalles del proceso de denuncia e investigación.",
		},
		{
			type: SafetyAndHealthDocumentType.SAFE_WORK,
			name: "Procedimientos de trabajo seguro",
			required: true,
			description:
				"Procedimientos específicos para trabajos que se realizarán en OTC, con antigüedad no mayor a un año.",
		},
		{
			type: SafetyAndHealthDocumentType.RISK_ANALYSIS,
			name: "Análisis de riesgos por actividad",
			required: true,
			description: "Documento que identifica aspectos ambientales y evalúa sus impactos.",
		},
		{
			type: SafetyAndHealthDocumentType.WORK_PERMIT,
			name: "Permisos de trabajo (en caso de aplicar)",
			description: "Documento opcional para el trabajo",
			required: true,
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
			name: "Plan de Gestión ambiental para trabajos en OTC",
			required: true,
			description:
				"Plan que detalla las medidas para protección del medio ambiente durante trabajos en OTC.",
		},
		{
			type: EnvironmentalDocType.SPILL_PREVENTION,
			name: "Procedimiento de Prevención y control de derrames",
			required: true,
			description: "Protocolo para prevenir y controlar derrames de sustancias peligrosas.",
		},
		{
			type: EnvironmentalDocType.WASTE_MANAGEMENT,
			name: "Procedimiento de manejo de residuos",
			required: true,
			description:
				"Procedimiento para gestión de residuos peligrosos, no peligrosos y domiciliarios.",
		},
		{
			type: EnvironmentalDocType.ENVIRONMENTAL_TRAINING,
			name: "Programa de capacitación en materia ambiental",
			required: true,
			description: "Plan de entrenamiento del personal en temas ambientales.",
		},
		{
			type: EnvironmentalDocType.ENVIRONMENTAL_MATRIX,
			name: "Matriz de identificación y evaluación de aspectos e impactos ambientales",
			required: true,
			description: "Documento que identifica aspectos ambientales y evalúa sus impactos.",
		},
		{
			type: EnvironmentalDocType.RECT_CERTIFICATE,
			name: "Certificado RECT",
			required: true,
			description:
				"Certificado de registro en sistemas de declaración de residuos peligrosos y no peligrosos.",
		},
		{
			type: EnvironmentalDocType.WATER_CERTIFICATE,
			name: "Certificado compra de agua potable",
			required: true,
			description: "Comprobante de adquisición de agua potable, si aplica.",
		},
		{
			type: EnvironmentalDocType.WATER_FACTORY_RESOLUTION,
			name: "Resolución sanitaria fábrica de botellones de agua",
			required: true,
			description: "Resolución sanitaria fábrica (o envasado) de botellones de agua.",
		},
		{
			type: EnvironmentalDocType.DINING_RESOLUTION,
			name: "Resolución sanitaria comedor",
			required: true,
			description:
				"Resolución sanitaria comedor o resolucion sanitaria lugar de colacion del personal.",
		},
		{
			type: EnvironmentalDocType.CHEMICAL_TOILET_CONTRACT,
			name: "Contrato entre empresa prestadora de servicio de limpieza de baños químicos",
			required: true,
			description:
				"Contrato entre empresa prestadora de servicio de limpieza de baños químicos, en caso de instalar faena al interior de OTC.",
		},
		{
			type: EnvironmentalDocType.SAFETY_DATA_SHEET,
			name: "Hojas de datos de todas las sustancias químicas a utilizar",
			required: true,
			description: "Hojas de datos de todas las sustancias químicas a utilizar.",
		},
	],
}

export const VEHICLE_STRUCTURE: StartupFolderStructure = {
	title: "Vehículos y Equipos",
	category: DocumentCategory.VEHICLES,
	description: "Documentación requerida para vehículos y equipos utilizados en trabajos de OTC.",
	documents: [
		{
			type: VehicleDocumentType.EQUIPMENT_FILE,
			name: "Ficha de equipos",
			required: true,
			description:
				"Documento con información técnica de los equipos que se utilizarán en el trabajo",
		},
		{
			type: VehicleDocumentType.VEHICLE_REGISTRATION,
			name: "Inscripción del Vehículo Motorizado (Padrón)",
			required: true,
			description: "Documento oficial que acredita la propiedad del vehículo",
		},
		{
			type: VehicleDocumentType.CIRCULATION_PERMIT,
			name: "Permiso de circulación",
			required: true,
			description: "Permiso vigente que autoriza la circulación del vehículo en vías públicas",
		},
		{
			type: VehicleDocumentType.TECHNICAL_REVIEW,
			name: "Revisión técnica",
			required: true,
			description:
				"Certificado vigente que acredita el cumplimiento de requisitos técnicos del vehículo",
		},
		{
			type: VehicleDocumentType.INSURANCE,
			name: "Seguro Obligatorio",
			required: true,
			description: "Póliza de seguro obligatorio de accidentes personales vigente",
		},
		{
			type: VehicleDocumentType.CHECKLIST,
			name: "Lista de chequeo previa al ingreso a OTC",
			required: true,
			description: "Verificación de condiciones del vehículo antes de ingresar a las instalaciones",
		},
	],
}

export const WORKER_STRUCTURE: StartupFolderStructure = {
	title: "Documentación Personal",
	category: DocumentCategory.PERSONNEL,
	description:
		"Documentación de trabajadores, incluyendo capacitaciones, certificados y autorizaciones.",
	documents: [
		{
			type: WorkerDocumentType.CONTRACT,
			name: "Contrato de Trabajo",
			required: true,
			description:
				"Incluir contrato base, anexos de prórroga o indefinido, según aplique. El contrato y sus anexos deben cumplir con la normativa laboral vigente en cuanto a jornada y remuneración.",
		},
		{
			type: WorkerDocumentType.INTERNAL_REGULATION_RECEIPT,
			name: "Entrega de Reglamento Interno",
			required: true,
			description:
				"Comprobante de recepción del reglamento interno de orden, debe coincidir con la última versión del reglamento presentado a OTC.",
		},
		{
			type: WorkerDocumentType.RISK_INFORMATION,
			name: "Inducción de Riesgos Laborales (IRL)",
			required: true,
			description:
				"Debe encontrarse con los contenidos mínimos establecidos en el DS 44, debe presentarse el documento completo.",
		},
		{
			type: WorkerDocumentType.ID_CARD,
			name: "Cédula de identidad",
			required: true,
			description: "Cédula de identidad vigente del trabajador con fotocopia por ambas caras.",
		},
		{
			type: WorkerDocumentType.DRIVING_LICENSE,
			name: "Licencia de conducir",
			required: false,
			description:
				" Fotocopia ambos lados de la Licencia de Conducir (según tipo, para quienes desempeñen la labor de conducción).",
		},
		{
			type: WorkerDocumentType.HEALTH_EXAM,
			name: "Examen médico vigente",
			required: true,
			description:
				"Según batería de exposición en OTC, emitido por un Organismo Administrador de la ley 16.744.",
		},
		{
			type: WorkerDocumentType.PSYCHOTECHNICAL_EXAM,
			name: "Examen Psico sensotécnico",
			required: true,
			description: "Examen Psico sensotécnico en caso de poseer licencia profesional.",
		},
		{
			type: WorkerDocumentType.RISK_MATRIX_TRAINING,
			name: "Registro de capacitación matriz de riesgos",
			required: true,
			description:
				"Registro de capacitación de la matriz de identificación de peligros y evaluación de riesgos presentada a OTC.",
		},
		{
			type: WorkerDocumentType.WORK_PROCEDURE_TRAINING,
			name: "Registro de capacitación procedimiento de trabajo",
			required: true,
			description: "Registro de capacitación del procedimiento de trabajo presentado a OTC.",
		},
		{
			type: WorkerDocumentType.EMERGENCY_PROCEDURE_TRAINING,
			name: "Registro de capacitación procedimiento de emergencia",
			required: true,
			description:
				"Registro de capacitación del Procedimiento de Emergencia y Acciones Por Seguir ante un Incidente o Accidente.",
		},
		{
			type: WorkerDocumentType.DEFENSIVE_DRIVING_TRAINING,
			name: "Registro de capacitación curso manejo defensivo",
			required: true,
			description:
				"Registro de capacitación curso manejo defensivo para quienes realicen labores de conducción.",
		},
		{
			type: WorkerDocumentType.MOUNTAIN_DEFENSIVE_DRIVING,
			name: "Curso de manejo defensivo en alta montaña.",
			required: true,
			description:
				"Curso de manejo defensivo en alta montaña, para quienes realicen labores de inspección o mantención del ducto en trayecto hacia Buta Mallín.",
		},
		{
			type: WorkerDocumentType.TOOLS_MAINTENANCE_TRAINING,
			name: "Registro de capacitacion del procedimiento de Mantencion de herramientas y equipos",
			required: true,
			description:
				"Registro de capacitacion del procedimiento de Mantencion de herramientas y equipos.",
		},
		{
			type: WorkerDocumentType.HARASSMENT_TRAINING,
			name: "Registro de capacitacion del procedimiento sobre Ley Karin",
			required: true,
			description: "Registro de capacitacion del procedimiento sobre Ley Karin.",
		},
		{
			type: WorkerDocumentType.HIGH_RISK_TRAINING,
			name: "Cursos específicos para trabajos de alto riesgo emitido por un organismo acreditado.",
			required: true,
			description:
				"Cursos específicos para trabajos de alto riesgo emitido por un organismo acreditado (espacios confinados, trabajo en altura, equipos energizados, sustancias peligrosas).",
		},
		{
			type: WorkerDocumentType.PPE_RECEIPT,
			name: "Registro de entrega de Elementos de Protección personal",
			required: true,
			description:
				"Registro de entrega de Elementos de Protección personal, acorde a lo establecido en la MIPER y Procedimientos.",
		},
		{
			type: WorkerDocumentType.PREVENTION_EXPERT,
			name: "Experto en Prevención de riesgos",
			required: true,
			description:
				"Experto en Prevención de riesgos; se debe incluir Resolución Sanitaria, Carné de experto, currículo.",
		},
	],
}
