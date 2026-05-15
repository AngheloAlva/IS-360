import type { ACTIVITY_TYPE, ACTIVITY_SEVERITY, ACTOR_TYPE, MODULES } from "@/generated/prisma/enums"

export interface ApiActivityLog {
	id: string
	timestamp: string
	module: MODULES
	action: ACTIVITY_TYPE
	entityId: string
	entityType: string
	metadata: Record<string, unknown> | null
	actorType: ACTOR_TYPE
	externalActor: { id: string; name: string; email: string } | null
	severity: ACTIVITY_SEVERITY | null
	ipAddress: string | null
	userAgent: string | null
	sessionId: string | null
	requestId: string | null
	changesBefore: unknown | null
	changesAfter: unknown | null
	user: {
		id: string
		name: string
		email: string
		image: string | null
		company: {
			id: string
			name: string
			rut: string
			image: string | null
		} | null
	} | null
}
