import type { SAFETY_TALK_CATEGORY } from "@/generated/prisma/enums"

export interface ApiSafetyTalk {
	id: string
	category: SAFETY_TALK_CATEGORY
	status: string
	score: number | null
	completedAt: string | null
	expiresAt: string | null
	currentAttempts: number
	lastAttemptAt: string | null
	isExternal?: boolean
	user?: {
		id: string
		name: string
		email: string
		rut: string
		company: {
			id: string
			name: string
		}
	}
	// Para usuarios externos
	externalVisitor?: {
		id: string
		name: string
		email: string
		rut: string
		company: {
			id: string
			name: string
		}
	}
}
