export const CodesValues = {
	INSTRUCTIVO: "INSTRUCTIVO",
	FORMULARIO: "FORMULARIO",
	PROCEDIMIENTO: "PROCEDIMIENTO",
} as const

export const CodesValuesArray = [
	CodesValues.INSTRUCTIVO,
	CodesValues.FORMULARIO,
	CodesValues.PROCEDIMIENTO,
] as const

export const CodeOptions = [
	{ value: "I", label: CodesValues.INSTRUCTIVO },
	{ value: "F", label: CodesValues.FORMULARIO },
	{ value: "P", label: CodesValues.PROCEDIMIENTO },
]
