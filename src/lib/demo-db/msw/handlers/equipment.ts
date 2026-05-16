import { http, HttpResponse } from "msw"

import { getDemoDb } from "@/lib/demo-db/client"

const listHandler = http.get("*/api/equipments", async ({ request }) => {
	const url = new URL(request.url)
	const page = parseInt(url.searchParams.get("page") || "1", 10)
	const limit = parseInt(url.searchParams.get("limit") || "10", 10)
	const search = url.searchParams.get("search") || ""
	const parentId = url.searchParams.get("parentId")
	const showAll = url.searchParams.get("showAll") === "true"
	const locationId = url.searchParams.get("locationId")
	const rootOnly = url.searchParams.get("rootOnly") === "true"
	const skip = (page - 1) * limit

	const db = await getDemoDb()
	const conditions: string[] = []
	const params: unknown[] = []
	if (!showAll && parentId) {
		params.push(parentId)
		conditions.push(`e."parentId" = $${params.length}`)
	} else if (rootOnly) {
		conditions.push(`e."parentId" IS NULL`)
	}
	if (locationId) {
		params.push(locationId)
		conditions.push(`e."locationId" = $${params.length}`)
	}
	if (search) {
		params.push(`%${search}%`)
		conditions.push(`(e.name ILIKE $${params.length} OR e.tag ILIKE $${params.length} OR e.barcode ILIKE $${params.length})`)
	}
	const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : ""

	const totalResult = await db.query<{ value: number }>(
		`SELECT COUNT(*)::int AS value FROM "equipment" e ${where}`,
		params
	)
	const total = totalResult.rows[0]?.value ?? 0

	const result = await db.query<Record<string, unknown>>(
		`SELECT
			e.id, e.name, e.description, e."isOperational", e.type, e.tag, e.barcode,
			e."locationId", e."parentId", e.criticality, e."imageUrl",
			e."createdAt", e."updatedAt",
			l.name AS "locationName", l.path AS "locationPath"
		 FROM "equipment" e
		 LEFT JOIN "Location" l ON l.id = e."locationId"
		 ${where}
		 ORDER BY e.name ASC
		 LIMIT ${limit} OFFSET ${skip}`,
		params
	)

	const equipments = result.rows.map((row) => ({
		id: row.id,
		name: row.name,
		description: row.description ?? "",
		isOperational: row.isOperational,
		type: row.type ?? null,
		tag: row.tag,
		barcode: row.barcode,
		locationId: row.locationId,
		parentId: row.parentId ?? null,
		criticality: row.criticality ?? null,
		imageUrl: row.imageUrl ?? null,
		createdAt: row.createdAt,
		updatedAt: row.updatedAt,
		location: {
			id: row.locationId,
			name: row.locationName ?? "",
			path: row.locationPath ?? "",
		},
		children: [],
		attachments: [],
		_count: { workOrders: 0, children: 0 },
	}))

	return HttpResponse.json({
		equipments,
		total,
		pages: Math.max(1, Math.ceil(total / limit)),
	})
})

export const equipmentHandlers = [listHandler]
