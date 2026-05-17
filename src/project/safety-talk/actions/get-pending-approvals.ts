import { getDemoUser } from "@/lib/demo-auth"
import { getDemoDb } from "@/lib/demo-db/client"

export async function getPendingApprovals() {
	if (!getDemoUser()) {
		throw new Error("No autorizado")
	}

	const db = await getDemoDb()
	const res = await db.query<{
		id: string
		category: string
		status: string
		score: number | null
		completedAt: string | null
		user_name: string | null
		user_email: string | null
	}>(
		`SELECT
			t.id, t.category, t.status, t.score, t."completedAt",
			u.name AS "user_name", u.email AS "user_email"
		 FROM "user_safety_talk" t
		 LEFT JOIN "user" u ON u.id = t."userId"
		 WHERE t.status = 'PASSED'
		 ORDER BY t."completedAt" DESC NULLS LAST`,
	)

	return res.rows.map((row) => ({
		id: row.id,
		category: row.category,
		status: row.status,
		score: row.score,
		completedAt: row.completedAt,
		user: row.user_name ? { name: row.user_name, email: row.user_email } : null,
	}))
}
