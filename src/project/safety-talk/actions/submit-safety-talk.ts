import { ACTIVITY_TYPE, MODULES } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { getDemoUser } from "@/lib/demo-auth"
import { getDemoDb } from "@/lib/demo-db/client"

import { scoreEnvironmentalAnswers } from "../utils/environmental-questions"
import { scoreIRLAnswers } from "../utils/irl-questions"

interface FormattedAnswer {
	questionId: number
	answer: string | string[]
}

export async function submitSafetyTalkAnswers(
	attemptId: string,
	category: "ENVIRONMENT" | "IRL",
	answers: FormattedAnswer[],
) {
	const user = getDemoUser()
	if (!user) {
		return { ok: false, message: "No autorizado" }
	}

	try {
		const db = await getDemoDb()
		const res = await db.query<{
			id: string
			currentAttempts: number
			minRequiredScore: number
		}>(
			`SELECT id, "currentAttempts", "minRequiredScore"
			 FROM "user_safety_talk"
			 WHERE id = $1 AND "userId" = $2 AND status = 'IN_PROGRESS'
			 LIMIT 1`,
			[attemptId, user.id],
		)
		const attempt = res.rows[0]
		if (!attempt) {
			return { ok: false, message: "Intento no encontrado o ya finalizado" }
		}

		const formatted = answers.map(({ questionId, answer }) => ({
			questionId,
			answer: Array.isArray(answer) ? answer.join(",") : answer,
		}))
		const score =
			category === "ENVIRONMENT"
				? scoreEnvironmentalAnswers(formatted)
				: scoreIRLAnswers(formatted)
		const passed = score >= attempt.minRequiredScore

		const now = new Date()
		const nowIso = now.toISOString()
		let status: "PASSED" | "FAILED" | "BLOCKED" = passed ? "PASSED" : "FAILED"
		let expiresAt: string | null = null
		let nextAttemptAt: string | null = null

		if (passed) {
			expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
		} else if (attempt.currentAttempts >= 3) {
			status = "BLOCKED"
			nextAttemptAt = null
		} else {
			const delayMs =
				attempt.currentAttempts === 1
					? 60 * 60 * 1000
					: attempt.currentAttempts === 2
						? 24 * 60 * 60 * 1000
						: 72 * 60 * 60 * 1000
			nextAttemptAt = new Date(Date.now() + delayMs).toISOString()
		}

		await db.query(
			`UPDATE "user_safety_talk"
			 SET status = $1, score = $2, "completedAt" = $3, "expiresAt" = $4,
			     "nextAttemptAt" = $5, "updatedAt" = $3
			 WHERE id = $6`,
			[status, score, nowIso, expiresAt, nextAttemptAt, attemptId],
		)

		await logActivity({
			userId: user.id,
			module: MODULES.SAFETY_TALK,
			action: ACTIVITY_TYPE.COMPLETE,
			entityId: attemptId,
			entityType: "UserSafetyTalk",
			metadata: {
				category,
				score,
				passed,
				attempt: attempt.currentAttempts,
			},
		})

		return {
			ok: true,
			attempt: { id: attemptId, status, score, expiresAt, nextAttemptAt },
		}
	} catch (error) {
		console.error("[SUBMIT_SAFETY_TALK]", error)
		return {
			ok: false,
			message: error instanceof Error ? error.message : "Error al enviar el examen",
		}
	}
}
