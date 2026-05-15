import type {
	TrafficLight,
	WorkerComplianceData,
} from "@/project/worker-compliance/types/worker-compliance"

const RED_FOLDER_STATUSES = new Set(["REJECTED", "EXPIRED"])
const YELLOW_FOLDER_STATUSES = new Set(["SUBMITTED", "TO_UPDATE", "DRAFT"])

const RED_TALK_STATUSES = new Set(["FAILED"])
const YELLOW_TALK_STATUSES = new Set(["IN_PROGRESS", "PENDING", "BLOCKED"])

export function computeTrafficLight(data: WorkerComplianceData): TrafficLight {
	const reasons: string[] = []
	let worst: "GREEN" | "YELLOW" | "RED" = "GREEN"

	function bump(level: "YELLOW" | "RED", reason: string): void {
		reasons.push(reason)
		if (level === "RED") {
			worst = "RED"
		} else if (worst === "GREEN") {
			worst = "YELLOW"
		}
	}

	// Safety Talks
	for (const talk of data.safetyTalks) {
		if (RED_TALK_STATUSES.has(talk.status)) {
			bump("RED", `Charla de seguridad reprobada`)
		} else if (YELLOW_TALK_STATUSES.has(talk.status)) {
			bump("YELLOW", `Charla de seguridad pendiente o en progreso`)
		}
	}

	// Worker Folders
	for (const folder of data.workerFolder) {
		const folderName = folder.startupFolder.name

		if (RED_FOLDER_STATUSES.has(folder.status)) {
			bump("RED", `Carpeta de trabajador (${folderName}) rechazada o expirada`)
		} else if (YELLOW_FOLDER_STATUSES.has(folder.status)) {
			bump("YELLOW", `Carpeta de trabajador (${folderName}) en revisión`)
		}

		// Check individual documents
		for (const doc of folder.documents) {
			if (RED_FOLDER_STATUSES.has(doc.status)) {
				bump("RED", `Documento en carpeta de trabajador (${folderName}) rechazado o expirado`)
				break
			}
		}
	}

	// Basic Folders
	for (const folder of data.basicFolder) {
		const folderName = folder.startupFolder.name

		if (RED_FOLDER_STATUSES.has(folder.status)) {
			bump("RED", `Carpeta básica (${folderName}) rechazada o expirada`)
		} else if (YELLOW_FOLDER_STATUSES.has(folder.status)) {
			bump("YELLOW", `Carpeta básica (${folderName}) en revisión`)
		}

		// Check individual documents
		for (const doc of folder.documents) {
			if (RED_FOLDER_STATUSES.has(doc.status)) {
				bump("RED", `Documento en carpeta básica (${folderName}) rechazado o expirado`)
				break
			}
		}
	}

	// No folders at all → RED (required folders missing)
	if (data.workerFolder.length === 0 && data.basicFolder.length === 0) {
		bump("RED", "Sin carpetas de trabajador asignadas")
	}

	// No safety talks at all → YELLOW
	if (data.safetyTalks.length === 0) {
		bump("YELLOW", "Sin charlas de seguridad registradas")
	}

	if (reasons.length === 0) {
		reasons.push("Toda la documentación está al día")
	}

	return { color: worst, reasons }
}
