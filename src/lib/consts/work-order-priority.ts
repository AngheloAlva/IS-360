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

export const WorkOrderPriorityLabels = {
	HIGH: "Alto",
	MEDIUM: "Medio",
	LOW: "Bajo",
}

export const WorkOrderPriorityOptions = [
	{
		value: WORK_ORDER_PRIORITY_VALUES.HIGH,
		label: WorkOrderPriorityLabels.HIGH,
	},
	{
		value: WORK_ORDER_PRIORITY_VALUES.MEDIUM,
		label: WorkOrderPriorityLabels.MEDIUM,
	},
	{
		value: WORK_ORDER_PRIORITY_VALUES.LOW,
		label: WorkOrderPriorityLabels.LOW,
	},
]
