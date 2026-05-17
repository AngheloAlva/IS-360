import {
	ACTIVITY_TYPE,
	MODULES,
	SAFETY_TALK_STATUS,
} from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { getDemoUser } from "@/lib/demo-auth"
import { getDemoDb } from "@/lib/demo-db/client"

import { SubmitSafetyTalkAttemptSchema } from "../schemas/attempt.schema"
import { scoreEnvironmentalAnswers } from "../utils/environmental-questions"

export async function submitSafetyTalkAttempt(data: unknown) {
	const user = getDemoUser()
	if (!user) {
		throw new Error("No autorizado")
	}

	const { category, answers } = SubmitSafetyTalkAttemptSchema.parse(data)
	const db = await getDemoDb()

	const existingRes = await db.query<{ id: string }>(
		`SELECT id FROM "user_safety_talk"
		 WHERE "userId" = $1 AND category = $2 AND status = $3
		 LIMIT 1`,
		[user.id, category, SAFETY_TALK_STATUS.IN_PROGRESS],
	)
	if (existingRes.rows[0]) {
		throw new Error("Ya tienes un intento en progreso")
	}

	const lastRes = await db.query<{
		currentAttempts: number
		nextAttemptAt: string | null
	}>(
		`SELECT "currentAttempts", "nextAttemptAt"
		 FROM "user_safety_talk"
		 WHERE "userId" = $1 AND category = $2 AND status = $3
		 ORDER BY "createdAt" DESC LIMIT 1`,
		[user.id, category, SAFETY_TALK_STATUS.FAILED],
	)
	const last = lastRes.rows[0]
	if (last?.nextAttemptAt && new Date(last.nextAttemptAt) > new Date()) {
		throw new Error(
			`Debes esperar hasta ${new Date(last.nextAttemptAt).toLocaleString()} para volver a intentar`,
		)
	}

	const id = crypto.randomUUID()
	const now = new Date()
	const nowIso = now.toISOString()
	const currentAttempts = (last?.currentAttempts ?? 0) + 1

	const createRes = await db.query<{ id: string; minRequiredScore: number }>(
		`INSERT INTO "user_safety_talk" (
			"id", "userId", category, status, "currentAttempts", "lastAttemptAt",
			"createdAt", "updatedAt"
		) VALUES ($1, $2, $3, $4, $5, $6, $6, $6)
		 RETURNING id, "minRequiredScore"`,
		[id, user.id, category, SAFETY_TALK_STATUS.IN_PROGRESS, currentAttempts, nowIso],
	)
	const created = createRes.rows[0]

	const score = scoreEnvironmentalAnswers(answers)
	const passed = score >= created.minRequiredScore
	const expiresAt = passed
		? new Date(new Date().setFullYear(now.getFullYear() + 1)).toISOString()
		: null
	const nextAttemptAt = passed
		? null
		: new Date(Date.now() + Math.pow(2, currentAttempts) * 24 * 60 * 60 * 1000).toISOString()

	await db.query(
		`UPDATE "user_safety_talk"
		 SET score = $1, status = $2, "completedAt" = $3, "expiresAt" = $4,
		     "nextAttemptAt" = $5, "updatedAt" = $3
		 WHERE id = $6`,
		[
			score,
			passed ? SAFETY_TALK_STATUS.PASSED : SAFETY_TALK_STATUS.FAILED,
			nowIso,
			expiresAt,
			nextAttemptAt,
			id,
		],
	)

	await logActivity({
		userId: user.id,
		module: MODULES.SAFETY_TALK,
		action: ACTIVITY_TYPE.SUBMIT,
		entityId: id,
		entityType: "UserSafetyTalk",
		metadata: { category, score, attemptNumber: currentAttempts },
	})

	return { success: true, attempt: { id, score, status: passed ? "PASSED" : "FAILED" } }
}
