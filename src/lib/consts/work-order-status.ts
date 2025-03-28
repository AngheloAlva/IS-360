export const WorkOrderStatus = {
	PENDING: "Pendiente",
	IN_PROGRESS: "En Proceso",
	COMPLETED: "Completado",
	CANCELLED: "Cancelado",
	EXPIRED: "Expirado",
} as const

export const WorkOrderStatusKeys = [
	WorkOrderStatus.PENDING,
	WorkOrderStatus.IN_PROGRESS,
	WorkOrderStatus.COMPLETED,
	WorkOrderStatus.CANCELLED,
	WorkOrderStatus.EXPIRED,
] as const

export const WorkOrderStatusOptions = [
	{
		value: WorkOrderStatus.PENDING,
		label: "Pendiente",
	},
	{
		value: WorkOrderStatus.IN_PROGRESS,
		label: "En Proceso",
	},
	{
		value: WorkOrderStatus.COMPLETED,
		label: "Completado",
	},
	{
		value: WorkOrderStatus.CANCELLED,
		label: "Cancelado",
	},
	{
		value: WorkOrderStatus.EXPIRED,
		label: "Expirado",
	},
]
