import { getDemoUser } from "@/lib/demo-auth"
import { getDemoDb } from "@/lib/demo-db/client"

export async function listLocations() {
	const user = getDemoUser()
	if (!user) {
		return { ok: false as const, message: "No autorizado", data: null }
	}

	const db = await getDemoDb()
	const result = await db.query<{
		id: string
		name: string
		parentId: string | null
		path: string
		equipmentCount: number
	}>(
		`SELECT
			l.id, l.name, l."parentId", l.path,
			(SELECT COUNT(*)::int FROM "equipment" e WHERE e."locationId" = l.id) AS "equipmentCount"
		 FROM "Location" l
		 ORDER BY l.path ASC`,
	)

	return { ok: true as const, data: result.rows }
}

export type LocationItem = {
	id: string
	name: string
	parentId: string | null
	path: string
	equipmentCount: number
}
