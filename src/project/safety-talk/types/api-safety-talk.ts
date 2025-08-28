import type { SAFETY_TALK_CATEGORY } from "@prisma/client"

export interface ApiSafetyTalk {
	id: string
	category: SAFETY_TALK_CATEGORY
	status: string
	score: number | null
	completedAt: string | null
	expiresAt: string | null
	currentAttempts: number
	user: {
		id: string
		name: string
		email: string
		company: {
			id: string
			name: string
		}
	}
}
