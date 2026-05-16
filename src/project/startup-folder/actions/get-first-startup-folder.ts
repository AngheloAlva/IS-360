import { getDemoDb } from "@/lib/demo-db/client"

interface GetFirstStartupFolderParams {
	companyId: string
	includeArchived?: boolean
	archivedOnly?: boolean
}

interface FirstStartupFolderResult {
	id: string
	isArchived: boolean
}

export async function getFirstStartupFolder({
	companyId,
	includeArchived = false,
	archivedOnly = false,
}: GetFirstStartupFolderParams): Promise<FirstStartupFolderResult | null> {
	const db = await getDemoDb()
	const archiveClause = archivedOnly
		? `AND "isArchived" = true`
		: includeArchived
			? ""
			: `AND "isArchived" = false`

	const res = await db.query<FirstStartupFolderResult>(
		`SELECT id, "isArchived"
		 FROM "startup_folder"
		 WHERE "companyId" = $1 AND "isDeleted" = false ${archiveClause}
		 ORDER BY "createdAt" DESC
		 LIMIT 1`,
		[companyId],
	)
	return res.rows[0] ?? null
}
