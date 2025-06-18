import { AREAS } from "@prisma/client"

export const UserAreasValues = {
	COMMUNITIES: AREAS.COMMUNITIES,
	ENVIRONMENT: AREAS.ENVIRONMENT,
	INTEGRITY_AND_MAINTENANCE: AREAS.INTEGRITY_AND_MAINTENANCE,
	LEGAL: AREAS.LEGAL,
	OPERATIONS: AREAS.OPERATIONS,
	OPERATIONAL_SAFETY: AREAS.OPERATIONAL_SAFETY,
	PROJECTS: AREAS.PROJECTS,
	DOCUMENTARY_LIBRARY: AREAS.DOCUMENTARY_LIBRARY,
	QUALITY_AND_OPERATIONAL_EXCELLENCE: AREAS.QUALITY_AND_OPERATIONAL_EXCELLENCE,
	PURCHASING: AREAS.PURCHASING,
	ADMINISTRATION_AND_FINANCES: AREAS.ADMINISTRATION_AND_FINANCES,
	IT: AREAS.IT,
	GERENCY: AREAS.GERENCY,
} as const

export const DocumentAreasValues = {
	COMMUNITIES: AREAS.COMMUNITIES,
	ENVIRONMENT: AREAS.ENVIRONMENT,
	INTEGRITY_AND_MAINTENANCE: AREAS.INTEGRITY_AND_MAINTENANCE,
	INSTRUCTIONS: AREAS.INSTRUCTIONS,
	LEGAL: AREAS.LEGAL,
	OPERATIONS: AREAS.OPERATIONS,
	OPERATIONAL_SAFETY: AREAS.OPERATIONAL_SAFETY,
	PROJECTS: AREAS.PROJECTS,
	DOCUMENTARY_LIBRARY: AREAS.DOCUMENTARY_LIBRARY,
	REGULATORY_COMPLIANCE: AREAS.REGULATORY_COMPLIANCE,
}

export const DocumentAreasValuesArray = [
	DocumentAreasValues.COMMUNITIES,
	DocumentAreasValues.ENVIRONMENT,
	DocumentAreasValues.INSTRUCTIONS,
	DocumentAreasValues.INTEGRITY_AND_MAINTENANCE,
	DocumentAreasValues.LEGAL,
	DocumentAreasValues.OPERATIONS,
	DocumentAreasValues.OPERATIONAL_SAFETY,
	DocumentAreasValues.PROJECTS,
	DocumentAreasValues.DOCUMENTARY_LIBRARY,
	DocumentAreasValues.REGULATORY_COMPLIANCE,
] as const

export const UserAreasValuesArray = [
	UserAreasValues.OPERATIONS,
	UserAreasValues.INTEGRITY_AND_MAINTENANCE,
	UserAreasValues.ENVIRONMENT,
	UserAreasValues.OPERATIONAL_SAFETY,
	UserAreasValues.QUALITY_AND_OPERATIONAL_EXCELLENCE,
	UserAreasValues.LEGAL,
	UserAreasValues.COMMUNITIES,
	UserAreasValues.PROJECTS,
	UserAreasValues.PURCHASING,
	UserAreasValues.ADMINISTRATION_AND_FINANCES,
	UserAreasValues.IT,
	UserAreasValues.GERENCY,
] as const

export const Areas = {
	"proyectos": {
		title: "Proyectos",
		value: AREAS.PROJECTS,
		description:
			"Gestiona y supervisa los proyectos de la empresa, asegurando eficiencia y cumplimiento de los procesos operativos.",
		className: "text-sky-500 hover:bg-sky-500/10 border-sky-500",
	},
	"biblioteca-documental": {
		title: "Biblioteca documental",
		value: AREAS.DOCUMENTARY_LIBRARY,
		description:
			"Reúne todos los procedimientos instructivo y formato Aplicables de los estándares de OTC",
		className: "text-blue-500 hover:bg-blue-500/10 hover:border-blue-500",
	},
	"comunidades": {
		title: "Comunidades",
		value: AREAS.COMMUNITIES,
		description:
			"Área enfocada en la relación con comunidades y actores externos, promoviendo el diálogo, la responsabilidad social y la comunicación corporativa.",
		className: "text-rose-500 hover:bg-rose-500/10 hover:border-rose-500",
	},
	"cumplimiento-normativo": {
		title: "Cumplimiento Normativo",
		value: AREAS.REGULATORY_COMPLIANCE,
		description:
			"Reúne información asociada al decreto 160, asegurando el cumplimiento de las normativas y regulaciones aplicables a la empresa.",
		className: "text-purple-500 hover:bg-purple-500/10 hover:border-purple-500",
	},
	"instructivos": {
		title: "Instructivos y formatos OTC",
		value: AREAS.INSTRUCTIONS,
		description:
			"Contiene documentos con guías y pasos detallados para la correcta ejecución de tareas y procedimientos dentro de la organización.",
		className: "text-indigo-500 hover:bg-indigo-500/10 hover:border-indigo-500",
	},
	"integridad-y-mantencion": {
		title: "Integridad y Mantención",
		value: AREAS.INTEGRITY_AND_MAINTENANCE,
		description:
			"Área enfocada en la conservación y correcto funcionamiento de equipos, infraestructuras y activos, garantizando su seguridad y durabilidad.",
		className: "text-orange-500 hover:bg-orange-500/10 hover:border-orange-500",
	},
	"juridica": {
		title: "Juridica / Legal",
		value: AREAS.LEGAL,
		description:
			"Se encarga de la asesoría legal, cumplimiento normativo y gestión de contratos, reduciendo riesgos legales y garantizando el marco jurídico adecuado.",
		className: "text-amber-500 hover:bg-amber-500/10 hover:border-amber-500",
	},
	"medio-ambiente": {
		title: "Medio Ambiente",
		value: AREAS.ENVIRONMENT,
		description:
			"Encargada de la gestión ambiental, promoviendo prácticas sostenibles, cumplimiento normativo y reducción del impacto ecológico.",
		className: "text-green-500 hover:bg-green-500/10 hover:border-green-500",
	},
	"operaciones": {
		title: "Operaciones",
		value: AREAS.OPERATIONS,
		description:
			"Gestiona y supervisa las actividades diarias de la empresa, asegurando eficiencia y cumplimiento de los procesos operativos.",
		className: "text-teal-500 hover:bg-teal-500/10 hover:border-teal-500",
	},
	"seguridad-operacional": {
		title: "Seguridad Operacional",
		value: AREAS.OPERATIONAL_SAFETY,
		description:
			"Responsable de minimizar accidentes y riesgos laborales mediante protocolos de seguridad, capacitaciones y cumplimiento de normativas.",
		className: "text-red-500 hover:bg-red-500/10 hover:border-red-500",
	},
} as const

export const AreaOptions = Object.values(Areas).map((area) => ({
	label: area.title,
	value: area.value,
}))

export const UserAreaOptions = [
	{ value: AREAS.COMMUNITIES, label: "Comunidades" },
	{ value: AREAS.ENVIRONMENT, label: "Medio Ambiente" },
	{ value: AREAS.INTEGRITY_AND_MAINTENANCE, label: "Integridad y Mantención" },
	{ value: AREAS.LEGAL, label: "Juridica / Legal" },
	{ value: AREAS.OPERATIONS, label: "Operaciones" },
	{ value: AREAS.OPERATIONAL_SAFETY, label: "Seguridad Operacional" },
	{ value: AREAS.PROJECTS, label: "Proyectos" },
	{
		value: AREAS.QUALITY_AND_OPERATIONAL_EXCELLENCE,
		label: "Calidad y Excelencia Operacional",
	},
	{ value: AREAS.PURCHASING, label: "Compras" },
	{ value: AREAS.ADMINISTRATION_AND_FINANCES, label: "Administración y Finanzas" },
	{ value: AREAS.IT, label: "Informática" },
	{ value: AREAS.GERENCY, label: "Gerencia" },
]

export const AreasLabels = {
	[AREAS.OPERATIONS]: "Operaciones",
	[AREAS.INSTRUCTIONS]: "Instructivos",
	[AREAS.INTEGRITY_AND_MAINTENANCE]: "Integridad y Mantención",
	[AREAS.ENVIRONMENT]: "Medio Ambiente",
	[AREAS.OPERATIONAL_SAFETY]: "Seguridad Operacional",
	[AREAS.QUALITY_AND_OPERATIONAL_EXCELLENCE]: "Calidad y Excelencia Operacional",
	[AREAS.DOCUMENTARY_LIBRARY]: "Biblioteca Documental",
	[AREAS.REGULATORY_COMPLIANCE]: "Cumplimiento Normativo",
	[AREAS.LEGAL]: "Juridica",
	[AREAS.COMMUNITIES]: "Comunidades",
	[AREAS.PROJECTS]: "Proyectos",
	[AREAS.PURCHASING]: "Compras",
	[AREAS.ADMINISTRATION_AND_FINANCES]: "Administración y Finanzas",
	[AREAS.IT]: "Informática",
	[AREAS.GERENCY]: "Gerencia",
}
