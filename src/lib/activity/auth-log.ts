import { headers } from "next/headers"

import {
	ACTIVITY_TYPE,
	MODULES,
	ACTOR_TYPE,
	ACTIVITY_SEVERITY,
} from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { auth } from "@/lib/auth"

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

export async function logAuthEvent({
	action,
	entityId,
	entityType,
	metadata,
	severity,
	changesBefore,
	changesAfter,
	module = MODULES.USERS,
}: LogAuthEventParams): Promise<void> {
	let actorId: string | null = null
	let actorType: ACTOR_TYPE | undefined

	try {
		const h = await headers()
		const session = await auth.api.getSession({ headers: h })
		actorId = session?.user?.id ?? null
	} catch {
		actorId = null
	}

	if (actorId == null) {
		actorType = "SYSTEM"
	}

	await logActivity({
		userId: actorId,
		module,
		action,
		entityId,
		entityType,
		metadata,
		actorType,
		severity,
		changesBefore,
		changesAfter,
	})
}
