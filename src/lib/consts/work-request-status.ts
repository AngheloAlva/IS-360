import { WORK_REQUEST_STATUS } from "@/generated/prisma/enums"

export const WorkRequestStatusLabels: Record<WORK_REQUEST_STATUS, string> = {
	[WORK_REQUEST_STATUS.REPORTED]: "Reportada",
	[WORK_REQUEST_STATUS.APPROVED]: "Aprobada",
	[WORK_REQUEST_STATUS.ATTENDED]: "Atendida",
	[WORK_REQUEST_STATUS.CANCELLED]: "Cancelada",
}
