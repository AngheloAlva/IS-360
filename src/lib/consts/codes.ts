export const CodesValues = {
	INSTRUCTIVO: "INSTRUCTIVO",
	FORMULARIO: "FORMULARIO",
	PROCEDIMIENTO: "PROCEDIMIENTO",
	RESPALDO: "RESPALDO",
	PLANILLA: "PLANILLA",
	OTRO: "OTRO",
} as const

export const CodesValuesArray = [
	CodesValues.INSTRUCTIVO,
	CodesValues.FORMULARIO,
	CodesValues.PROCEDIMIENTO,
	CodesValues.RESPALDO,
	CodesValues.PLANILLA,
] as const

export const CodeOptions = [
	{ value: CodesValues.INSTRUCTIVO, label: "Instructivo" },
	{ value: CodesValues.FORMULARIO, label: "Formulario" },
	{ value: CodesValues.PROCEDIMIENTO, label: "Procedimiento" },
	{ value: CodesValues.RESPALDO, label: "Respaldo" },
	{ value: CodesValues.PLANILLA, label: "Planilla" },
	{ value: CodesValues.OTRO, label: "Otro" },
]
