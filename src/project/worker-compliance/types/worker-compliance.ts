import type {
	SAFETY_TALK_CATEGORY,
	SAFETY_TALK_STATUS,
	ReviewStatus,
} from "@/generated/prisma/enums"

export type TrafficLight = {
	color: "GREEN" | "YELLOW" | "RED"
	reasons: string[]
}

export type SectionStatus = "GREEN" | "YELLOW" | "RED" | "MISSING"

export type WorkerComplianceDocument = {
	id: string
	type: string
	status: ReviewStatus
	expirationDate: Date | null
	reviewNotes: string | null
}

export type WorkerComplianceFolder = {
	id: string
	status: ReviewStatus
	submittedAt: Date | null
	updatedAt: Date
	startupFolderId: string
	startupFolder: {
		id: string
		name: string
		status: string
	}
	documents: WorkerComplianceDocument[]
}

export type WorkerComplianceWorkerFolder = WorkerComplianceFolder & {
	isDriver: boolean
}

export type WorkerComplianceSafetyTalk = {
	category: SAFETY_TALK_CATEGORY
	status: SAFETY_TALK_STATUS
	score: number | null
	minRequiredScore: number
	completedAt: Date | null
	expiresAt: Date | null
	lastAttemptAt: Date | null
	manuallyApproved: boolean
}

export type WorkerComplianceData = {
	id: string
	name: string
	rut: string
	image: string | null
	role: string
	internalRole: string | null
	company: {
		id: string
		name: string
		isActive: boolean
	} | null
	safetyTalks: WorkerComplianceSafetyTalk[]
	workerFolder: WorkerComplianceWorkerFolder[]
	basicFolder: WorkerComplianceFolder[]
}
