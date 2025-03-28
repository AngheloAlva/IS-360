export const WorkOrderPriority = {
	HIGH: "Alto",
	MEDIUM: "Medio",
	LOW: "Bajo",
} as const

export const WorkOrderPriorityKeys = [
	WorkOrderPriority.HIGH,
	WorkOrderPriority.MEDIUM,
	WorkOrderPriority.LOW,
] as const

export const WorkOrderPriorityOptions = [
	{
		value: WorkOrderPriority.HIGH,
		label: "Alto",
	},
	{
		value: WorkOrderPriority.MEDIUM,
		label: "Medio",
	},
	{
		value: WorkOrderPriority.LOW,
		label: "Bajo",
	},
]
