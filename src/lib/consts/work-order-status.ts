export const WorkOrderStatus = {
	PENDING: "Pendiente",
	IN_PROGRESS: "En Proceso",
	COMPLETED: "Completado",
	CANCELLED: "Cancelado",
	EXPIRED: "Expirado",
} as const

export const WorkOrderStatusKeys = [
	"PENDING",
	"IN_PROGRESS",
	"COMPLETED",
	"CANCELLED",
	"EXPIRED",
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
