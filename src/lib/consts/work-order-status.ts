export const WorkOrderStatus = {
	PENDING: "PENDING",
	IN_PROGRESS: "IN_PROGRESS",
	COMPLETED: "COMPLETED",
	CANCELLED: "CANCELLED",
	EXPIRED: "EXPIRED",
} as const

export const WorkOrderStatusKeys = [
	WorkOrderStatus.PENDING,
	WorkOrderStatus.IN_PROGRESS,
	WorkOrderStatus.COMPLETED,
	WorkOrderStatus.CANCELLED,
	WorkOrderStatus.EXPIRED,
] as const

export type WorkOrderStatus = keyof typeof WorkOrderStatus

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
