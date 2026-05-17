import { getDemoUser } from "@/lib/demo-auth"
import { getDemoDb } from "@/lib/demo-db/client"

import type { SAFETY_TALK_CATEGORY, SAFETY_TALK_STATUS } from "@/generated/prisma/enums"

export interface SafetyTalkHistoryRow {
	id: string
	category: SAFETY_TALK_CATEGORY
	status: SAFETY_TALK_STATUS
	score: number | null
	completedAt: Date | null
	user: { name: string; email: string }
	approvalBy: { name: string } | null
}

export async function getSafetyTalkHistory(): Promise<SafetyTalkHistoryRow[]> {
	if (!getDemoUser()) {
		throw new Error("No autorizado")
	}

	const db = await getDemoDb()
	const res = await db.query<{
		id: string
		category: SAFETY_TALK_CATEGORY
		status: SAFETY_TALK_STATUS
		score: number | null
		completedAt: string | null
		user_name: string | null
		user_email: string | null
		ab_name: string | null
	}>(
		`SELECT
			t.id, t.category, t.status, t.score, t."completedAt",
			u.name AS "user_name", u.email AS "user_email",
			ab.name AS "ab_name"
		 FROM "user_safety_talk" t
		 LEFT JOIN "user" u ON u.id = t."userId"
		 LEFT JOIN "user" ab ON ab.id = t."approvalById"
		 WHERE t.status IN ('MANUALLY_APPROVED', 'FAILED', 'BLOCKED')
		 ORDER BY t."completedAt" DESC NULLS LAST`,
	)

	return res.rows.map((row) => ({
		id: row.id,
		category: row.category,
		status: row.status,
		score: row.score,
		completedAt: row.completedAt ? new Date(row.completedAt) : null,
		user: { name: row.user_name ?? "", email: row.user_email ?? "" },
		approvalBy: row.ab_name ? { name: row.ab_name } : null,
	}))
}
