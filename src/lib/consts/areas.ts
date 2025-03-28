export const SimpleAreas = [
	"OPERATIONS",
	"INSTRUCTIONS",
	"INTEGRITY_AND_MAINTENANCE",
	"ENVIRONMENT",
	"RISK_PREVENTION",
	"QUALITY_AND_PROFESSIONAL_EXCELLENCE",
	"HSEQ",
	"LEGAL",
	"COMMUNITIES",
	"PROJECTS",
] as const

export const SpecialAreas = {
	proyectos: {
		title: "PROYECTOS",
		value: "PROJECTS",
		description:
			"Gestiona y supervisa los proyectos de la empresa, asegurando eficiencia y cumplimiento de los procesos operativos.",
	},
} as const

export const Areas = {
	"operaciones": {
		title: "OPERACIONES",
		value: "OPERATIONS",
		description:
			"Gestiona y supervisa las actividades diarias de la empresa, asegurando eficiencia y cumplimiento de los procesos operativos.",
	},
	"instructivos": {
		title: "INSTRUCTIVOS Y FORMATOS OTC",
		value: "INSTRUCTIONS",
		description:
			"Contiene documentos con guías y pasos detallados para la correcta ejecución de tareas y procedimientos dentro de la organización.",
	},
	"integridad-y-mantencion": {
		title: "INTEGRIDAD_Y_MANTENCION",
		value: "INTEGRITY_AND_MAINTENANCE",
		description:
			"Área enfocada en la conservación y correcto funcionamiento de equipos, infraestructuras y activos, garantizando su seguridad y durabilidad.",
	},
	"medio-ambiente": {
		title: "MEDIO_AMBIENTE",
		value: "ENVIRONMENT",
		description:
			"Encargada de la gestión ambiental, promoviendo prácticas sostenibles, cumplimiento normativo y reducción del impacto ecológico.",
	},
	"prevencion-riesgos": {
		title: "PREVENCION_RIESGOS",
		value: "RISK_PREVENTION",
		description:
			"Responsable de minimizar accidentes y riesgos laborales mediante protocolos de seguridad, capacitaciones y cumplimiento de normativas.",
	},
	"calidad-y-excelencia-profesional": {
		title: "CALIDAD_Y_EXCELENCIA_OPERACIONAL",
		value: "QUALITY_AND_PROFESSIONAL_EXCELLENCE",
		description:
			"Busca garantizar la mejora continua, estandarización y cumplimiento de altos estándares de calidad en todos los procesos y servicios.",
	},
	"hseq": {
		title: "HSEQ",
		value: "HSEQ",
		description:
			"Asegura el cumplimiento de normativas y estándares en salud, seguridad, medio ambiente y calidad, promoviendo un entorno de trabajo seguro y sostenible.",
	},
	"juridica": {
		title: "JURIDICA",
		value: "LEGAL",
		description:
			"Se encarga de la asesoría legal, cumplimiento normativo y gestión de contratos, reduciendo riesgos legales y garantizando el marco jurídico adecuado.",
	},
	"comunidades": {
		title: "COMUNIDADES",
		value: "COMMUNITIES",
		description:
			"Área enfocada en la relación con comunidades y actores externos, promoviendo el diálogo, la responsabilidad social y la comunicación corporativa.",
	},
} as const

export const AreasLabels = {
	OPERATIONS: "OPERACIONES",
	INSTRUCTIONS: "INSTRUCTIVOS",
	INTEGRITY_AND_MAINTENANCE: "INTEGRIDAD Y MANTENCION",
	ENVIRONMENT: "MEDIO AMBIENTE",
	RISK_PREVENTION: "PREVENCION RIESGOS",
	QUALITY_AND_PROFESSIONAL_EXCELLENCE: "CALIDAD Y EXCELENCIA PROFESIONAL",
	HSEQ: "HSEQ",
	LEGAL: "JURIDICA",
	COMMUNITIES: "COMUNIDADES",
	PROJECTS: "PROYECTOS",
}
