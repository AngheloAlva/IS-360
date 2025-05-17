import { ReviewStatus } from "@prisma/client"

export const FOLDER_REVIEW_STATUS_LABEL = {
	[ReviewStatus.DRAFT]: "Borrador",
	[ReviewStatus.SUBMITTED]: "En revisión",
	[ReviewStatus.APPROVED]: "Aprobado",
	[ReviewStatus.REJECTED]: "Rechazado",
	[ReviewStatus.EXPIRED]: "Expirado",
}
