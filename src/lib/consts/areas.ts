export const AreasValues = {
	OPERATIONS: "OPERATIONS",
	INSTRUCTIONS: "INSTRUCTIONS",
	INTEGRITY_AND_MAINTENANCE: "INTEGRITY_AND_MAINTENANCE",
	ENVIRONMENT: "ENVIRONMENT",
	RISK_PREVENTION: "RISK_PREVENTION",
	QUALITY_AND_PROFESSIONAL_EXCELLENCE: "QUALITY_AND_PROFESSIONAL_EXCELLENCE",
	HSEQ: "HSEQ",
	LEGAL: "LEGAL",
	COMMUNITIES: "COMMUNITIES",
	PROJECTS: "PROJECTS",
} as const

export const AreasValuesArray = [
	AreasValues.OPERATIONS,
	AreasValues.INSTRUCTIONS,
	AreasValues.INTEGRITY_AND_MAINTENANCE,
	AreasValues.ENVIRONMENT,
	AreasValues.RISK_PREVENTION,
	AreasValues.QUALITY_AND_PROFESSIONAL_EXCELLENCE,
	AreasValues.HSEQ,
	AreasValues.LEGAL,
	AreasValues.COMMUNITIES,
	AreasValues.PROJECTS,
] as const

export const Areas = {
	"proyectos": {
		title: "Proyectos",
		value: AreasValues.PROJECTS,
		description:
			"Gestiona y supervisa los proyectos de la empresa, asegurando eficiencia y cumplimiento de los procesos operativos.",
	},
	"operaciones": {
		title: "Operaciones",
		value: AreasValues.OPERATIONS,
		description:
			"Gestiona y supervisa las actividades diarias de la empresa, asegurando eficiencia y cumplimiento de los procesos operativos.",
	},
	"instructivos": {
		title: "Instructivos y formatos OTC",
		value: AreasValues.INSTRUCTIONS,
		description:
			"Contiene documentos con guías y pasos detallados para la correcta ejecución de tareas y procedimientos dentro de la organización.",
	},
	"integridad-y-mantencion": {
		title: "Integridad y Mantención",
		value: AreasValues.INTEGRITY_AND_MAINTENANCE,
		description:
			"Área enfocada en la conservación y correcto funcionamiento de equipos, infraestructuras y activos, garantizando su seguridad y durabilidad.",
	},
	"medio-ambiente": {
		title: "Medio Ambiente",
		value: AreasValues.ENVIRONMENT,
		description:
			"Encargada de la gestión ambiental, promoviendo prácticas sostenibles, cumplimiento normativo y reducción del impacto ecológico.",
	},
	"prevencion-riesgos": {
		title: "Prevención de Riesgos",
		value: AreasValues.RISK_PREVENTION,
		description:
			"Responsable de minimizar accidentes y riesgos laborales mediante protocolos de seguridad, capacitaciones y cumplimiento de normativas.",
	},
	"calidad-y-excelencia-profesional": {
		title: "Calidad y Excelencia Profesional",
		value: AreasValues.QUALITY_AND_PROFESSIONAL_EXCELLENCE,
		description:
			"Busca garantizar la mejora continua, estandarización y cumplimiento de altos estándares de calidad en todos los procesos y servicios.",
	},
	"hseq": {
		title: "HSEQ",
		value: AreasValues.HSEQ,
		description:
			"Asegura el cumplimiento de normativas y estándares en salud, seguridad, medio ambiente y calidad, promoviendo un entorno de trabajo seguro y sostenible.",
	},
	"juridica": {
		title: "Juridica",
		value: AreasValues.LEGAL,
		description:
			"Se encarga de la asesoría legal, cumplimiento normativo y gestión de contratos, reduciendo riesgos legales y garantizando el marco jurídico adecuado.",
	},
	"comunidades": {
		title: "Comunidades",
		value: AreasValues.COMMUNITIES,
		description:
			"Área enfocada en la relación con comunidades y actores externos, promoviendo el diálogo, la responsabilidad social y la comunicación corporativa.",
	},
} as const

export const AreasLabels = {
	OPERATIONS: "Operaciones",
	INSTRUCTIONS: "Instructivos",
	INTEGRITY_AND_MAINTENANCE: "Integridad y Mantención",
	ENVIRONMENT: "Medio Ambiente",
	RISK_PREVENTION: "Prevención de Riesgos",
	QUALITY_AND_PROFESSIONAL_EXCELLENCE: "Calidad y Excelencia Profesional",
	HSEQ: "HSEQ",
	LEGAL: "Juridica",
	COMMUNITIES: "Comunidades",
	PROJECTS: "Proyectos",
}

export const areaColors: Record<string, { className: string }> = {
	"operaciones": {
		className: "text-[#26A69A] border-[#26A69A]",
	},
	"instructivos": {
		className: "text-[#5A6B7F] border-[#5A6B7F]",
	},
	"integridad-y-mantencion": {
		className: "text-[#F08C42] border-[#F08C42]",
	},
	"medio-ambiente": {
		className: "text-[#4CAF50] border-[#4CAF50]",
	},
	"prevencion-riesgos": {
		className: "text-[#FF5722] border-[#FF5722]",
	},
	"calidad-y-excelencia-profesional": {
		className: "text-[#2196F3] border-[#2196F3]",
	},
	"hseq": {
		className: "text-[#009688] border-[#009688]",
	},
	"juridica": {
		className: "text-[#424242] border-[#424242]",
	},
	"comunidades": {
		className: "text-yellow-500 border-yellow-500",
	},
}
