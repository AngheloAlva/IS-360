export const WorkOrderPriority = {
	HIGH: "HIGH",
	MEDIUM: "MEDIUM",
	LOW: "LOW",
} as const

export const WorkOrderPriorityKeys = [
	WorkOrderPriority.HIGH,
	WorkOrderPriority.MEDIUM,
	WorkOrderPriority.LOW,
] as const

export type WorkOrderPriority = keyof typeof WorkOrderPriority

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
