export const AreasValues = {
	OPERATIONS: "OPERATIONS",
	INSTRUCTIONS: "INSTRUCTIONS",
	INTEGRITY_AND_MAINTENANCE: "INTEGRITY_AND_MAINTENANCE",
	ENVIRONMENT: "ENVIRONMENT",
	OPERATIONAL_SAFETY: "OPERATIONAL_SAFETY",
	QUALITY_AND_OPERATIONAL_EXCELLENCE: "QUALITY_AND_OPERATIONAL_EXCELLENCE",
	REGULATORY_COMPLIANCE: "REGULATORY_COMPLIANCE",
	LEGAL: "LEGAL",
	COMMUNITIES: "COMMUNITIES",
	PROJECTS: "PROJECTS",
} as const

export const AreasValuesArray = [
	AreasValues.OPERATIONS,
	AreasValues.INSTRUCTIONS,
	AreasValues.INTEGRITY_AND_MAINTENANCE,
	AreasValues.ENVIRONMENT,
	AreasValues.OPERATIONAL_SAFETY,
	AreasValues.QUALITY_AND_OPERATIONAL_EXCELLENCE,
	AreasValues.REGULATORY_COMPLIANCE,
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
		className: "text-sky-500 hover:bg-sky-500/10 border-sky-500",
	},
	"operaciones": {
		title: "Operaciones",
		value: AreasValues.OPERATIONS,
		description:
			"Gestiona y supervisa las actividades diarias de la empresa, asegurando eficiencia y cumplimiento de los procesos operativos.",
		className: "text-teal-500 hover:bg-teal-500/10 hover:border-teal-500",
	},
	"instructivos": {
		title: "Instructivos y formatos OTC",
		value: AreasValues.INSTRUCTIONS,
		description:
			"Contiene documentos con guías y pasos detallados para la correcta ejecución de tareas y procedimientos dentro de la organización.",
		className: "text-indigo-500 hover:bg-indigo-500/10 hover:border-indigo-500",
	},
	"integridad-y-mantencion": {
		title: "Integridad y Mantención",
		value: AreasValues.INTEGRITY_AND_MAINTENANCE,
		description:
			"Área enfocada en la conservación y correcto funcionamiento de equipos, infraestructuras y activos, garantizando su seguridad y durabilidad.",
		className: "text-orange-500 hover:bg-orange-500/10 hover:border-orange-500",
	},
	"medio-ambiente": {
		title: "Medio Ambiente",
		value: AreasValues.ENVIRONMENT,
		description:
			"Encargada de la gestión ambiental, promoviendo prácticas sostenibles, cumplimiento normativo y reducción del impacto ecológico.",
		className: "text-green-500 hover:bg-green-500/10 hover:border-green-500",
	},
	"seguridad-operacional": {
		title: "Seguridad Operacional",
		value: AreasValues.OPERATIONAL_SAFETY,
		description:
			"Responsable de minimizar accidentes y riesgos laborales mediante protocolos de seguridad, capacitaciones y cumplimiento de normativas.",
		className: "text-red-500 hover:bg-red-500/10 hover:border-red-500",
	},
	"calidad-y-excelencia-operacional": {
		title: "Calidad y Excelencia Operacional",
		value: AreasValues.QUALITY_AND_OPERATIONAL_EXCELLENCE,
		description:
			"Busca garantizar la mejora continua, estandarización y cumplimiento de altos estándares de calidad en todos los procesos y servicios.",
		className: "text-blue-500 hover:bg-blue-500/10 hover:border-blue-500",
	},
	"cumplimiento-normativo": {
		title: "Cumplimiento Normativo",
		value: AreasValues.REGULATORY_COMPLIANCE,
		description:
			"Reúne información asociada al decreto 160, asegurando el cumplimiento de las normativas y regulaciones aplicables a la empresa.",
		className: "text-purple-500 hover:bg-purple-500/10 hover:border-purple-500",
	},
	"juridica": {
		title: "Juridica",
		value: AreasValues.LEGAL,
		description:
			"Se encarga de la asesoría legal, cumplimiento normativo y gestión de contratos, reduciendo riesgos legales y garantizando el marco jurídico adecuado.",
		className: "text-amber-500 hover:bg-amber-500/10 hover:border-amber-500",
	},
	"comunidades": {
		title: "Comunidades",
		value: AreasValues.COMMUNITIES,
		description:
			"Área enfocada en la relación con comunidades y actores externos, promoviendo el diálogo, la responsabilidad social y la comunicación corporativa.",
		className: "text-rose-500 hover:bg-rose-500/10 hover:border-rose-500",
	},
} as const

export const AreaOptions = Object.values(Areas).map((area) => ({
	label: area.title,
	value: area.value,
}))

export const AreasLabels = {
	OPERATIONS: "Operaciones",
	INSTRUCTIONS: "Instructivos",
	INTEGRITY_AND_MAINTENANCE: "Integridad y Mantención",
	ENVIRONMENT: "Medio Ambiente",
	OPERATIONAL_SAFETY: "Seguridad Operacional",
	QUALITY_AND_OPERATIONAL_EXCELLENCE: "Calidad y Excelencia Operacional",
	REGULATORY_COMPLIANCE: "Cumplimiento Normativo",
	LEGAL: "Juridica",
	COMMUNITIES: "Comunidades",
	PROJECTS: "Proyectos",
}
