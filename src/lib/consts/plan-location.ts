export const PLAN_LOCATION_VALUES = {
	PRS: "PRS",
	TRM: "TRM",
	OTHER: "OTHER",
} as const

export const PLAN_LOCATION_VALUES_ARRAY = [
	PLAN_LOCATION_VALUES.PRS,
	PLAN_LOCATION_VALUES.TRM,
	PLAN_LOCATION_VALUES.OTHER,
] as const

export const PlanLocationOptions = [
	{
		label: "PRS",
		value: PLAN_LOCATION_VALUES.PRS,
	},
	{
		label: "TRM",
		value: PLAN_LOCATION_VALUES.TRM,
	},
	{
		label: "OTRO",
		value: PLAN_LOCATION_VALUES.OTHER,
	},
]

export const PlanLocationLabels = {
	[PLAN_LOCATION_VALUES.PRS]: "PRS",
	[PLAN_LOCATION_VALUES.TRM]: "TRM",
	[PLAN_LOCATION_VALUES.OTHER]: "OTRO",
}
