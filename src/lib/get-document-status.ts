import {
	WORKER_STRUCTURE,
	VEHICLE_STRUCTURE,
	ENVIRONMENTAL_STRUCTURE,
	SAFETY_AND_HEALTH_STRUCTURE,
} from "./consts/startup-folders-structure"
import {
	ReviewStatus,
	WorkerDocument,
	VehicleDocument,
	DocumentCategory,
	WorkerDocumentType,
	VehicleDocumentType,
	EnvironmentalDocType,
	EnvironmentalDocument,
	SafetyAndHealthDocumentType,
	SafetyAndHealthDocument,
} from "@prisma/client"

export const getDocumentStatus = (
	sectionKey: DocumentCategory,
	documentType:
		| WorkerDocumentType
		| VehicleDocumentType
		| EnvironmentalDocType
		| SafetyAndHealthDocumentType,
	documents:
		| WorkerDocument[]
		| VehicleDocument[]
		| SafetyAndHealthDocument[]
		| EnvironmentalDocument[]
) => {
	let document:
		| WorkerDocument
		| VehicleDocument
		| SafetyAndHealthDocument
		| EnvironmentalDocument
		| null = null
	let isRequired = false
	let description = ""
	let status: ReviewStatus = ReviewStatus.DRAFT

	switch (sectionKey) {
		case DocumentCategory.VEHICLES:
			const vehicleDoc = VEHICLE_STRUCTURE.documents.find((doc) => doc.type === documentType)

			if (vehicleDoc) {
				isRequired = vehicleDoc.required
				description = vehicleDoc.description || "Documento de vehículo"

				document = documents.find((doc) => doc.type === documentType) ?? null

				if (document) {
					status = document.status
				}
			}
			break

		case DocumentCategory.PERSONNEL:
			const workerDoc = WORKER_STRUCTURE.documents.find((doc) => doc.type === documentType)

			if (workerDoc) {
				isRequired = workerDoc.required
				description = workerDoc.description || "Documento de trabajador"

				document = documents.find((doc) => doc.type === documentType) ?? null

				if (document) {
					status = document.status
				}
			}
			break

		case DocumentCategory.ENVIRONMENTAL:
			const envDoc = ENVIRONMENTAL_STRUCTURE.documents.find((doc) => doc.type === documentType)

			if (envDoc) {
				isRequired = envDoc.required
				description = envDoc.description || "Documento ambiental"

				document = documents.find((doc) => doc.type === documentType) ?? null

				if (document) {
					status = document.status
				}
			}
			break

		case DocumentCategory.SAFETY_AND_HEALTH:
			const safetyDoc = SAFETY_AND_HEALTH_STRUCTURE.documents.find(
				(doc) => doc.type === documentType
			)

			if (safetyDoc) {
				isRequired = safetyDoc.required
				description = safetyDoc.description || "Documento de seguridad y salud"

				document =
					documents.find(
						(doc) =>
							doc.type === documentType && doc.category === DocumentCategory.SAFETY_AND_HEALTH
					) ?? null

				if (document) {
					status = document.status
				}
			}
			break

		default:
			break
	}

	// Verificamos si el documento está subido
	const isUploaded = !!document && document.url !== ""

	return {
		document,
		isUploaded,
		isRequired,
		description,
		status,
	}
}
