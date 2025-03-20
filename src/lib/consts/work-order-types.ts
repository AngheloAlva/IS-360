export const WorkOrderType = {
	CORRECTIVE: "CORRECTIVE",
	PREVENTIVE: "PREVENTIVE",
	PREDICTIVE: "PREDICTIVE",
} as const

export const WorkOrderTypeKeys = [
	WorkOrderType.CORRECTIVE,
	WorkOrderType.PREVENTIVE,
	WorkOrderType.PREDICTIVE,
] as const

export type WorkOrderType = keyof typeof WorkOrderType

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
