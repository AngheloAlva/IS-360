export const WorkOrderType = {
	CORRECTIVE: "Correctivo",
	PREVENTIVE: "Preventivo",
	PREDICTIVE: "Predictivo",
} as const

export const WorkOrderTypeKeys = ["CORRECTIVE", "PREVENTIVE", "PREDICTIVE"] as const

export const WorkOrderTypeOptions = [
	{
		value: "CORRECTIVE",
		label: "Correctivo",
	},
	{
		value: "PREVENTIVE",
		label: "Preventivo",
	},
	{
		value: "PREDICTIVE",
		label: "Predictivo",
	},
]
