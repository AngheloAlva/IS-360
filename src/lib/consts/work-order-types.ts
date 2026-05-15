export const WORK_ORDER_TYPE_VALUES = {
	CORRECTIVE: "CORRECTIVE",
	PREVENTIVE: "PREVENTIVE",
	PREDICTIVE: "PREDICTIVE",
	PROACTIVE: "PROACTIVE",
	// PROJECT: "PROJECT",
} as const

export const WORK_ORDER_TYPE_VALUES_ARRAY = [
	WORK_ORDER_TYPE_VALUES.CORRECTIVE,
	WORK_ORDER_TYPE_VALUES.PREVENTIVE,
	WORK_ORDER_TYPE_VALUES.PREDICTIVE,
	WORK_ORDER_TYPE_VALUES.PROACTIVE,
	// WORK_ORDER_TYPE_VALUES.PROJECT,
] as const

export const WorkOrderTypeLabels = {
	CORRECTIVE: "Correctivo",
	PREVENTIVE: "Preventivo",
	PREDICTIVE: "Predictivo",
	PROACTIVE: "Proactivo",
	// PROJECT: "Proyecto",
}

export const WorkOrderTypeOptions = [
	{
		value: WORK_ORDER_TYPE_VALUES.CORRECTIVE,
		label: WorkOrderTypeLabels.CORRECTIVE,
	},
	{
		value: WORK_ORDER_TYPE_VALUES.PREVENTIVE,
		label: WorkOrderTypeLabels.PREVENTIVE,
	},
	{
		value: WORK_ORDER_TYPE_VALUES.PREDICTIVE,
		label: WorkOrderTypeLabels.PREDICTIVE,
	},
	{
		value: WORK_ORDER_TYPE_VALUES.PROACTIVE,
		label: WorkOrderTypeLabels.PROACTIVE,
	},
	// {
	// 	value: WORK_ORDER_TYPE_VALUES.PROJECT,
	// 	label: "Proyecto",
	// },
]
