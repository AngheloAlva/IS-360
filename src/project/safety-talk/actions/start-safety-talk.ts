import { ACTIVITY_TYPE, MODULES, type SAFETY_TALK_CATEGORY } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { getDemoUser } from "@/lib/demo-auth"
import { getDemoDb } from "@/lib/demo-db/client"

export interface SafetyTalkAttemptHandle {
	id: string
	currentAttempts: number
	startedAt: string
	nextAttemptAt: string | null
}

interface StartSafetyTalkResult {
	ok: boolean
	attempt?: SafetyTalkAttemptHandle
	message?: string
}

export async function startSafetyTalk(
	category: SAFETY_TALK_CATEGORY,
): Promise<StartSafetyTalkResult> {
	const user = getDemoUser()
	if (!user) {
		return { ok: false, message: "No autorizado" }
	}

	try {
		const db = await getDemoDb()
		const existingRes = await db.query<{
			id: string
			currentAttempts: number
			nextAttemptAt: string | null
			startedAt: string | null
		}>(
			`SELECT id, "currentAttempts", "nextAttemptAt", "startedAt"
			 FROM "user_safety_talk"
			 WHERE "userId" = $1 AND category = $2 AND status = 'IN_PROGRESS'
			 LIMIT 1`,
			[user.id, category],
		)
		const existing = existingRes.rows[0]

		if (existing) {
			if (existing.nextAttemptAt && new Date(existing.nextAttemptAt) > new Date()) {
				return {
					ok: true,
					attempt: {
						id: existing.id,
						currentAttempts: existing.currentAttempts,
						startedAt: existing.startedAt ?? new Date().toISOString(),
						nextAttemptAt: existing.nextAttemptAt,
					},
				}
			}
			await db.query(
				`UPDATE "user_safety_talk"
				 SET status = 'FAILED', score = 0, "updatedAt" = $1
				 WHERE id = $2`,
				[new Date().toISOString(), existing.id],
			)
		}

		const id = crypto.randomUUID()
		const now = new Date()
		const nowIso = now.toISOString()
		const nextAttempt = new Date(now.getTime() + 30 * 60 * 1000).toISOString()
		const currentAttempts = (existing?.currentAttempts ?? 0) + 1

		await db.query(
			`INSERT INTO "user_safety_talk" (
				"id", "userId", category, status, "currentAttempts", "startedAt",
				"lastAttemptAt", "nextAttemptAt", "createdAt", "updatedAt"
			) VALUES ($1, $2, $3, 'IN_PROGRESS', $4, $5, $5, $6, $5, $5)`,
			[id, user.id, category, currentAttempts, nowIso, nextAttempt],
		)

		await logActivity({
			userId: user.id,
			module: MODULES.SAFETY_TALK,
			action: ACTIVITY_TYPE.CREATE,
			entityId: id,
			entityType: "UserSafetyTalk",
			metadata: { category, status: "IN_PROGRESS" },
		})

		return {
			ok: true,
			attempt: {
				id,
				currentAttempts,
				startedAt: nowIso,
				nextAttemptAt: nextAttempt,
			},
		}
	} catch (error) {
		console.error("[START_SAFETY_TALK]", error)
		return {
			ok: false,
			message: error instanceof Error ? error.message : "Error al iniciar la charla",
		}
	}
}
