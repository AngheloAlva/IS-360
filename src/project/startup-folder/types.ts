import type {
	ReviewStatus,
	WorkerDocumentType,
	VehicleDocumentType,
	EnvironmentalDocType,
	SafetyAndHealthDocumentType,
} from "@prisma/client"

export interface BaseStartupFolderDocument {
	id: string
	name: string
	url: string
	uploadedAt: Date
	status: ReviewStatus
	reviewNotes: string | null
	reviewedAt: Date | null
	submittedAt: Date | null
	expirationDate: Date | null
	uploadedBy: {
		id: string
		name: string
	} | null
	uploadedById: string | null
	folderId: string
}

export interface WorkerStartupFolderDocument extends BaseStartupFolderDocument {
	category: "PERSONNEL"
	type: WorkerDocumentType
}

export interface VehicleStartupFolderDocument extends BaseStartupFolderDocument {
	category: "VEHICLES"
	type: VehicleDocumentType
}

export interface SafetyAndHealthStartupFolderDocument extends BaseStartupFolderDocument {
	category: "SAFETY_AND_HEALTH"
	type: SafetyAndHealthDocumentType
}

export interface EnvironmentalStartupFolderDocument extends BaseStartupFolderDocument {
	category: "ENVIRONMENTAL"
	type: EnvironmentalDocType
}

export type StartupFolderDocument =
	| WorkerStartupFolderDocument
	| VehicleStartupFolderDocument
	| SafetyAndHealthStartupFolderDocument
	| EnvironmentalStartupFolderDocument
