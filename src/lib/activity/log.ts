import type {
	ACTIVITY_TYPE,
	MODULES,
	ACTOR_TYPE,
	ACTIVITY_SEVERITY,
} from "@/generated/prisma/enums"

interface ActivityLogParams {
	userId?: string | null
	module: MODULES
	action: ACTIVITY_TYPE
	entityId: string
	entityType: string
	metadata?: unknown
	actorType?: ACTOR_TYPE
	externalActorId?: string | null
	severity?: ACTIVITY_SEVERITY
	changesBefore?: unknown
	changesAfter?: unknown
}

export async function logActivity(params: ActivityLogParams): Promise<void> {
	if (process.env.NODE_ENV !== "production") {
		console.debug("[demo] activity log", {
			module: params.module,
			action: params.action,
			entityId: params.entityId,
		})
	}
}
