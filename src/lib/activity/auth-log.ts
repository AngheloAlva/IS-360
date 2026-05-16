import type {
	ACTIVITY_TYPE,
	MODULES,
	ACTIVITY_SEVERITY,
} from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"

interface LogAuthEventParams {
	action: ACTIVITY_TYPE
	entityId: string
	entityType: string
	metadata?: Record<string, unknown>
	severity?: ACTIVITY_SEVERITY
	changesBefore?: unknown
	changesAfter?: unknown
	module?: MODULES
}

export async function logAuthEvent(params: LogAuthEventParams): Promise<void> {
	await logActivity({
		userId: null,
		actorType: "SYSTEM",
		...params,
		module: params.module ?? ("USERS" as MODULES),
	})
}
