import type {
	ReviewStatus,
	WorkerDocumentType,
	VehicleDocumentType,
	EnvironmentalDocType,
	SafetyAndHealthDocumentType,
} from "@prisma/client"

export interface StartupFolderDocument {
	id: string
	name: string
	url: string | null
	status: ReviewStatus
	reviewNotes: string | null
	expirationDate: Date | null
	type:
		| WorkerDocumentType
		| VehicleDocumentType
		| EnvironmentalDocType
		| SafetyAndHealthDocumentType
	uploadedBy: {
		name: string
	} | null
}
