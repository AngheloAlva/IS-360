import { ACTIVITY_TYPE, MODULES, type SAFETY_TALK_CATEGORY } from "@/generated/prisma/enums"
import { logActivity } from "@/lib/activity/log"
import { getDemoUser } from "@/lib/demo-auth"
import { getDemoDb } from "@/lib/demo-db/client"

interface UserSafetyTalkRow {
	id: string
	userId: string
	category: SAFETY_TALK_CATEGORY
	status: string
	currentAttempts: number
	startedAt: string | null
	lastAttemptAt: string | null
	nextAttemptAt: string | null
	score: number | null
	minRequiredScore: number
	completedAt: string | null
	expiresAt: string | null
	createdAt: string
	updatedAt: string
	manuallyApproved: boolean
	inPersonSessionDate: string | null
	approvalById: string | null
	ab_name: string | null
}

interface AttemptRow {
	id: string
	userSafetyTalkId: string
	score: number
	completedAt: string
}

async function loadAttempts(userSafetyTalkIds: string[]): Promise<Map<string, AttemptRow[]>> {
	const map = new Map<string, AttemptRow[]>()
	if (!userSafetyTalkIds.length) return map
	const db = await getDemoDb()
	const placeholders = userSafetyTalkIds.map((_, i) => `$${i + 1}`).join(", ")
	const res = await db.query<AttemptRow>(
		`SELECT id, "userSafetyTalkId", score, "completedAt"
		 FROM "safety_talk_attempt"
		 WHERE "userSafetyTalkId" IN (${placeholders})
		 ORDER BY "completedAt" DESC`,
		userSafetyTalkIds,
	)
	for (const a of res.rows) {
		const list = map.get(a.userSafetyTalkId) ?? []
		list.push(a)
		map.set(a.userSafetyTalkId, list)
	}
	return map
}

function buildRow(row: UserSafetyTalkRow, attempts: AttemptRow[]) {
	return {
		id: row.id,
		userId: row.userId,
		category: row.category,
		status: row.status,
		currentAttempts: row.currentAttempts,
		startedAt: row.startedAt,
		lastAttemptAt: row.lastAttemptAt,
		nextAttemptAt: row.nextAttemptAt,
		score: row.score,
		minRequiredScore: row.minRequiredScore,
		completedAt: row.completedAt,
		expiresAt: row.expiresAt,
		createdAt: row.createdAt,
		updatedAt: row.updatedAt,
		manuallyApproved: row.manuallyApproved,
		inPersonSessionDate: row.inPersonSessionDate,
		approvalById: row.approvalById,
		approvalBy: row.ab_name ? { name: row.ab_name } : null,
		attempts: attempts.map((a) => ({
			id: a.id,
			score: a.score,
			completedAt: a.completedAt,
		})),
	}
}

export async function getUserSafetyTalks() {
	const user = getDemoUser()
	if (!user) {
		return { ok: false, message: "No autorizado" }
	}

	try {
		const db = await getDemoDb()
		const res = await db.query<UserSafetyTalkRow>(
			`SELECT t.*, u.name AS "ab_name"
			 FROM "user_safety_talk" t
			 LEFT JOIN "user" u ON u.id = t."approvalById"
			 WHERE t."userId" = $1
			 ORDER BY t."createdAt" DESC`,
			[user.id],
		)
		const attemptsByTalk = await loadAttempts(res.rows.map((r) => r.id))
		const safetyTalks = res.rows.map((row) => buildRow(row, attemptsByTalk.get(row.id) ?? []))

		await logActivity({
			userId: user.id,
			module: MODULES.SAFETY_TALK,
			action: ACTIVITY_TYPE.VIEW,
			entityId: "all",
			entityType: "UserSafetyTalk",
			metadata: { count: safetyTalks.length },
		})

		return { ok: true, safetyTalks }
	} catch (error) {
		console.error("[GET_USER_SAFETY_TALKS]", error)
		return { ok: false, message: "Error al obtener las charlas" }
	}
}

export async function getSafetyTalkByCategory(category: SAFETY_TALK_CATEGORY) {
	const user = getDemoUser()
	if (!user) return null

	try {
		const db = await getDemoDb()
		const res = await db.query<UserSafetyTalkRow>(
			`SELECT t.*, u.name AS "ab_name"
			 FROM "user_safety_talk" t
			 LEFT JOIN "user" u ON u.id = t."approvalById"
			 WHERE t."userId" = $1 AND t.category = $2
			 ORDER BY t."createdAt" DESC
			 LIMIT 1`,
			[user.id, category],
		)
		const row = res.rows[0]
		if (!row) return null
		const attemptsByTalk = await loadAttempts([row.id])
		const result = buildRow(row, attemptsByTalk.get(row.id) ?? [])

		await logActivity({
			userId: user.id,
			module: MODULES.SAFETY_TALK,
			action: ACTIVITY_TYPE.VIEW,
			entityId: row.id,
			entityType: "UserSafetyTalk",
			metadata: { category, status: row.status, score: row.score },
		})

		return result
	} catch (error) {
		console.error("[GET_SAFETY_TALK_BY_CATEGORY]", error)
		return null
	}
}

export async function deleteSafetyTalkAttempt(id: string) {
	const user = getDemoUser()
	if (!user) return { ok: false, message: "No autorizado" }

	try {
		const db = await getDemoDb()
		const res = await db.query<{ id: string; category: string; status: string }>(
			`DELETE FROM "user_safety_talk" WHERE id = $1 RETURNING id, category, status`,
			[id],
		)
		const deleted = res.rows[0]
		if (!deleted) {
			return { ok: false, message: "Intento de charla no encontrado" }
		}

		await logActivity({
			userId: user.id,
			module: MODULES.SAFETY_TALK,
			action: ACTIVITY_TYPE.DELETE,
			entityId: deleted.id,
			entityType: "UserSafetyTalk",
			metadata: { category: deleted.category, status: deleted.status },
		})

		return { ok: true, message: "Intento de charla eliminado exitosamente" }
	} catch (error) {
		console.error("[DELETE_SAFETY_TALK_ATTEMPT]", error)
		return {
			ok: false,
			message: error instanceof Error ? error.message : "Error al eliminar el intento de charla",
		}
	}
}
