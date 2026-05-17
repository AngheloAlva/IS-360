import { getDemoUser } from "@/lib/demo-auth"
import { getDemoDb } from "@/lib/demo-db/client"

export async function getUserSafetyTalks() {
	const user = getDemoUser()
	if (!user) return { ok: false, message: "No autorizado" }

	try {
		const db = await getDemoDb()
		const talksRes = await db.query<{
			id: string
			userId: string
			category: string
			status: string
			currentAttempts: number
			startedAt: string | null
			lastAttemptAt: string | null
			nextAttemptAt: string | null
			score: number | null
			completedAt: string | null
			expiresAt: string | null
			createdAt: string
			updatedAt: string
			manuallyApproved: boolean
			inPersonSessionDate: string | null
			approvalById: string | null
			ab_name: string | null
		}>(
			`SELECT t.*, u.name AS "ab_name"
			 FROM "user_safety_talk" t
			 LEFT JOIN "user" u ON u.id = t."approvalById"
			 WHERE t."userId" = $1
			 ORDER BY t."createdAt" DESC`,
			[user.id],
		)

		const ids = talksRes.rows.map((r) => r.id)
		const attemptsByTalk = new Map<string, Array<{ id: string; score: number; completedAt: string }>>()
		if (ids.length) {
			const placeholders = ids.map((_, i) => `$${i + 1}`).join(", ")
			const attRes = await db.query<{
				id: string
				userSafetyTalkId: string
				score: number
				completedAt: string
			}>(
				`SELECT id, "userSafetyTalkId", score, "completedAt"
				 FROM "safety_talk_attempt"
				 WHERE "userSafetyTalkId" IN (${placeholders})
				 ORDER BY "completedAt" DESC`,
				ids,
			)
			for (const a of attRes.rows) {
				const list = attemptsByTalk.get(a.userSafetyTalkId) ?? []
				list.push({ id: a.id, score: a.score, completedAt: a.completedAt })
				attemptsByTalk.set(a.userSafetyTalkId, list)
			}
		}

		const safetyTalks = talksRes.rows.map((row) => ({
			...row,
			approvalBy: row.ab_name ? { name: row.ab_name } : null,
			attempts: attemptsByTalk.get(row.id) ?? [],
		}))

		return { ok: true, safetyTalks }
	} catch (error) {
		console.error("[GET_USER_SAFETY_TALKS]", error)
		return { ok: false, message: "Error al obtener las charlas" }
	}
}
