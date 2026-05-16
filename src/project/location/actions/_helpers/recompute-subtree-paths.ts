import type { PGlite } from "@electric-sql/pglite"

export async function recomputeSubtreePaths(
	db: PGlite,
	rootId: string,
): Promise<void> {
	const rootResult = await db.query<{ name: string; parentId: string | null }>(
		`SELECT name, "parentId" FROM "Location" WHERE id = $1`,
		[rootId],
	)
	const root = rootResult.rows[0]
	if (!root) return

	let parentPath: string | null = null
	if (root.parentId) {
		const parentResult = await db.query<{ path: string }>(
			`SELECT path FROM "Location" WHERE id = $1`,
			[root.parentId],
		)
		parentPath = parentResult.rows[0]?.path ?? null
	}

	const newRootPath = parentPath ? `${parentPath} / ${root.name}` : root.name
	const now = new Date().toISOString()

	await db.query(
		`UPDATE "Location" SET path = $1, "updatedAt" = $2 WHERE id = $3`,
		[newRootPath, now, rootId],
	)

	const descendantsResult = await db.query<{
		id: string
		name: string
		parentId: string
		depth: number
	}>(
		`WITH RECURSIVE tree AS (
			SELECT id, name, "parentId", 1 AS depth FROM "Location" WHERE "parentId" = $1
			UNION ALL
			SELECT l.id, l.name, l."parentId", t.depth + 1 FROM "Location" l
			JOIN tree t ON l."parentId" = t.id
		)
		SELECT id, name, "parentId", depth FROM tree ORDER BY depth ASC, id ASC`,
		[rootId],
	)

	const pathById = new Map<string, string>([[rootId, newRootPath]])

	for (const node of descendantsResult.rows) {
		const parentPathLocal = pathById.get(node.parentId)!
		const newPath = `${parentPathLocal} / ${node.name}`
		pathById.set(node.id, newPath)
		await db.query(
			`UPDATE "Location" SET path = $1, "updatedAt" = $2 WHERE id = $3`,
			[newPath, now, node.id],
		)
	}
}
