export const WorkOrderType = {
	CORRECTIVE: "Correctivo",
	PREVENTIVE: "Preventivo",
	PREDICTIVE: "Predictivo",
} as const

export const WorkOrderTypeKeys = ["CORRECTIVE", "PREVENTIVE", "PREDICTIVE"] as const

export const WorkOrderTypeOptions = [
	{
		value: WorkOrderType.CORRECTIVE,
		label: "Correctivo",
	},
	{
		value: WorkOrderType.PREVENTIVE,
		label: "Preventivo",
	},
	{
		value: WorkOrderType.PREDICTIVE,
		label: "Predictivo",
	},
]
