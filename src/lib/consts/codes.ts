export const CodesValues = {
	PROCEDIMIENTO: "PROCEDIMIENTO",
	INSTRUCTIVO: "INSTRUCTIVO",
	FORMULARIO: "FORMULARIO",
	RESPALDO: "RESPALDO",
	REGISTRO: "REGISTRO",
	PLANILLA: "PLANILLA",
	FORMATO: "FORMATO",
	OTRO: "OTRO",
} as const

export const CodesValuesArray = [
	CodesValues.INSTRUCTIVO,
	CodesValues.FORMULARIO,
	CodesValues.PROCEDIMIENTO,
	CodesValues.RESPALDO,
	CodesValues.PLANILLA,
	CodesValues.REGISTRO,
	CodesValues.FORMATO,
] as const

export const CodeOptions = [
	{ value: CodesValues.INSTRUCTIVO, label: "Instructivo" },
	{ value: CodesValues.FORMULARIO, label: "Formulario" },
	{ value: CodesValues.PROCEDIMIENTO, label: "Procedimiento" },
	{ value: CodesValues.RESPALDO, label: "Respaldo" },
	{ value: CodesValues.PLANILLA, label: "Planilla" },
	{ value: CodesValues.REGISTRO, label: "Registro" },
	{ value: CodesValues.FORMATO, label: "Formato" },
	{ value: CodesValues.OTRO, label: "Otro" },
]
