export const WorkOrderPriority = {
	HIGH: "Alto",
	MEDIUM: "Medio",
	LOW: "Bajo",
} as const

export const WorkOrderPriorityKeys = ["HIGH", "MEDIUM", "LOW"] as const

export const WorkOrderPriorityOptions = [
	{
		value: "HIGH",
		label: "Alto",
	},
	{
		value: "MEDIUM",
		label: "Medio",
	},
	{
		value: "LOW",
		label: "Bajo",
	},
]
