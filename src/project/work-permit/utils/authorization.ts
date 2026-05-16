import { getDemoDb } from "@/lib/demo-db/client"

export async function hasWorkPermitUpdatePermission(_userId: string): Promise<boolean> {
	return true
}

export async function getScopedWorkPermitId({
	workPermitId,
}: {
	workPermitId: string
	userId: string
}): Promise<string | null> {
	const db = await getDemoDb()
	const result = await db.query<{ id: string }>(
		`SELECT id FROM "work_permit" WHERE id = $1 LIMIT 1`,
		[workPermitId],
	)
	return result.rows[0]?.id ?? null
}
