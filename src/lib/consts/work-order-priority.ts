export const WORK_ORDER_PRIORITY_VALUES = {
	HIGH: "HIGH",
	MEDIUM: "MEDIUM",
	LOW: "LOW",
} as const

export const WORK_ORDER_PRIORITY_VALUES_ARRAY = [
	WORK_ORDER_PRIORITY_VALUES.HIGH,
	WORK_ORDER_PRIORITY_VALUES.MEDIUM,
	WORK_ORDER_PRIORITY_VALUES.LOW,
] as const

export const WorkOrderPriorityOptions = [
	{
		value: WORK_ORDER_PRIORITY_VALUES.HIGH,
		label: "Alto",
	},
	{
		value: WORK_ORDER_PRIORITY_VALUES.MEDIUM,
		label: "Medio",
	},
	{
		value: WORK_ORDER_PRIORITY_VALUES.LOW,
		label: "Bajo",
	},
]
