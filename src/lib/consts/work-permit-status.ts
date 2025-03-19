export const WorkPermitStatus = {
	PENDING: "PENDING",
	IN_PROGRESS: "IN_PROGRESS",
	COMPLETED: "COMPLETED",
	CANCELLED: "CANCELLED",
	EXPIRED: "EXPIRED",
} as const

export const WorkPermitStatusKeys = [
	WorkPermitStatus.PENDING,
	WorkPermitStatus.IN_PROGRESS,
	WorkPermitStatus.COMPLETED,
	WorkPermitStatus.CANCELLED,
	WorkPermitStatus.EXPIRED,
] as const

export type WorkPermitStatus = keyof typeof WorkPermitStatus

export const WorkPermitStatusOptions = [
	{
		value: WorkPermitStatus.PENDING,
		label: "Pendiente",
	},
	{
		value: WorkPermitStatus.IN_PROGRESS,
		label: "En Proceso",
	},
	{
		value: WorkPermitStatus.COMPLETED,
		label: "Completado",
	},
	{
		value: WorkPermitStatus.CANCELLED,
		label: "Cancelado",
	},
	{
		value: WorkPermitStatus.EXPIRED,
		label: "Expirado",
	},
]
