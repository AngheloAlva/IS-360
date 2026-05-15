import type { INSPECTION_STATUS, INSPECTION_COMMENT_TYPE } from "@/generated/prisma/enums"

export type InspectionDisplayStatus =
	| "REPORTED"
	| "ANSWERED_BY_CONTRACTOR"
	| "ANSWERED_BY_OTC"
	| "RESOLVED"

export interface InspectionComment {
	type: INSPECTION_COMMENT_TYPE
	createdAt: Date
}

/**
 * Calcula el estado visual de una inspección basado en su estado actual
 * y el último comentario registrado.
 *
 * Flujo de estados:
 * 1. REPORTED - Inspector OTC crea la inspección
 * 2. ANSWERED_BY_CONTRACTOR - Supervisor contratista respondió
 * 3. ANSWERED_BY_OTC - Inspector OTC aprobó o rechazó
 * 4. Loop entre 2-3 si hay rechazo
 * 5. RESOLVED - Inspector OTC aprobó finalmente (estado final en BD)
 */
export function getInspectionDisplayStatus(
	inspectionStatus: INSPECTION_STATUS,
	comments?: InspectionComment[]
): InspectionDisplayStatus {
	// Si ya está resuelta en la BD, mostrar como resuelta
	if (inspectionStatus === "RESOLVED") {
		return "RESOLVED"
	}

	// Si no hay comentarios, está en estado inicial reportado
	if (!comments || comments.length === 0) {
		return "REPORTED"
	}

	// Ordenar comentarios por fecha (más reciente primero)
	const sortedComments = [...comments].sort(
		(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
	)

	// Obtener el último comentario
	const lastComment = sortedComments[0]

	// Determinar estado basado en el tipo del último comentario
	switch (lastComment.type) {
		case "SUPERVISOR_RESPONSE":
			return "ANSWERED_BY_CONTRACTOR"
		case "RESPONSIBLE_APPROVAL":
		case "RESPONSIBLE_REJECTION":
			return "ANSWERED_BY_OTC"
		default:
			return "REPORTED"
	}
}

export const INSPECTION_STATUS_LABELS: Record<InspectionDisplayStatus, string> = {
	REPORTED: "Reportada",
	ANSWERED_BY_CONTRACTOR: "Contestada por Contratista",
	ANSWERED_BY_OTC: "Contestada por OTC",
	RESOLVED: "Resuelta",
}

export const INSPECTION_STATUS_COLORS: Record<
	InspectionDisplayStatus,
	{ badge: string; text?: string }
> = {
	REPORTED: {
		badge: "border-orange-500 bg-orange-500/10 text-orange-500",
	},
	ANSWERED_BY_CONTRACTOR: {
		badge: "border-blue-500 bg-blue-500/10 text-blue-500",
	},
	ANSWERED_BY_OTC: {
		badge: "border-purple-500 bg-purple-500/10 text-purple-500",
	},
	RESOLVED: {
		badge: "border-green-500 bg-green-500/10 text-green-500",
	},
}
