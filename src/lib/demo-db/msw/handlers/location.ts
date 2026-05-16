import { http, HttpResponse } from "msw"

import { getDemoDb } from "@/lib/demo-db/client"

const listHandler = http.get("*/api/locations", async () => {
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
			(SELECT COUNT(*)::int FROM "equipment" e
			 WHERE e."locationId" = l.id
			   AND (l.name = 'Sin ubicación' AND l."parentId" IS NULL OR e."parentId" IS NULL)
			) AS "equipmentCount"
		 FROM "Location" l
		 ORDER BY l.path ASC`,
	)

	return HttpResponse.json(result.rows)
})

export const locationHandlers = [listHandler]
