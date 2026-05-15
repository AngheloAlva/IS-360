export const InspectionType = ["NO_CONFORMITY", "SAFETY_OBSERVATION", "SUPERVISED_COMMENT"] as const

export const InspectionTypeOptions = [
	{
		label: "No conformidades",
		value: "NO_CONFORMITY",
	},
	{
		label: "Observaciones de seguridad",
		value: "SAFETY_OBSERVATION",
	},
	{
		label: "Comentarios de supervisión",
		value: "SUPERVISED_COMMENT",
	},
]
