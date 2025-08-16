import { MILESTONE_STATUS } from "@prisma/client"

export const MILESTONE_STATUS_LABELS = {
	[MILESTONE_STATUS.PENDING]: "Pendiente",
	[MILESTONE_STATUS.COMPLETED]: "Completado",
	[MILESTONE_STATUS.IN_PROGRESS]: "En Progreso",
	[MILESTONE_STATUS.REQUESTED_CLOSURE]: "Cierre Solicitado",
}
