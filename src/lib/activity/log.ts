import { headers } from "next/headers"

import {
	ACTIVITY_TYPE,
	MODULES,
	ACTOR_TYPE,
	ACTIVITY_SEVERITY,
} from "@/generated/prisma/enums"
import { Prisma } from "@/generated/prisma/client"
import { auth } from "@/lib/auth"
import prisma from "../prisma"

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

const AUTO_SEVERITY: Record<ACTIVITY_TYPE, ACTIVITY_SEVERITY> = {
	CREATE: "LOW",
	UPDATE: "LOW",
	VIEW: "LOW",
	DOWNLOAD: "LOW",
	COMMENT: "LOW",
	LOGIN: "LOW",
	LOGOUT: "LOW",
	APPROVE: "MEDIUM",
	REJECT: "MEDIUM",
	SUBMIT: "MEDIUM",
	COMPLETE: "MEDIUM",
	CANCEL: "MEDIUM",
	ASSIGN: "MEDIUM",
	UNASSIGN: "MEDIUM",
	DELETE: "HIGH",
	UPLOAD: "HIGH",
}

export async function logActivity({
	userId,
	module,
	action,
	entityId,
	entityType,
	metadata,
	actorType,
	externalActorId,
	severity,
	changesBefore,
	changesAfter,
}: ActivityLogParams): Promise<void> {
	let ipAddress: string | undefined
	let userAgent: string | undefined
	let requestId: string | undefined
	let sessionId: string | null = null

	try {
		const h = await headers()
		ipAddress =
			h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
			h.get("x-real-ip") ??
			undefined
		userAgent = h.get("user-agent") ?? undefined
		requestId = h.get("x-request-id") ?? undefined

		try {
			const session = await auth.api.getSession({ headers: h })
			sessionId = session?.session?.id ?? null
		} catch {
			sessionId = null
		}
	} catch {
		// Called outside request scope (e.g. background job) — skip header extraction
	}

	const normalizedUserId = userId === "" ? null : userId ?? null

	const resolvedActorType: ACTOR_TYPE =
		actorType ??
		(normalizedUserId != null
			? "USER"
			: externalActorId != null
				? "EXTERNAL_VISITOR"
				: "SYSTEM")

	const resolvedSeverity: ACTIVITY_SEVERITY = severity ?? AUTO_SEVERITY[action] ?? "LOW"

	try {
		await prisma.activityLog.create({
			data: {
				userId: normalizedUserId,
				module,
				action,
				entityId,
				entityType,
				metadata: metadata != null ? (metadata as Prisma.JsonObject) : undefined,
				actorType: resolvedActorType,
				externalActorId: externalActorId ?? null,
				severity: resolvedSeverity,
				changesBefore:
					changesBefore != null ? (changesBefore as Prisma.JsonObject) : undefined,
				changesAfter:
					changesAfter != null ? (changesAfter as Prisma.JsonObject) : undefined,
				ipAddress,
				userAgent,
				requestId,
				sessionId,
			},
		})
	} catch (error) {
		console.error("[audit] log failed", error)
	}
}
