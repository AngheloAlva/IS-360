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
			l.name AS "locationName", l.path AS "locationPath",
			(SELECT COUNT(*)::int FROM "equipment" c WHERE c."parentId" = e.id) AS "childrenCount",
			(SELECT COUNT(*)::int FROM "_EquipmentToWorkOrder" ew WHERE ew."A" = e.id) AS "workOrdersCount"
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
		_count: {
			workOrders: row.workOrdersCount ?? 0,
			children: row.childrenCount ?? 0,
		},
	}))

	return HttpResponse.json({
		equipments,
		total,
		pages: Math.max(1, Math.ceil(total / limit)),
	})
})

const detailHandler = http.get("*/api/equipments/:id", async ({ params }) => {
	const id = params.id as string
	const db = await getDemoDb()

	const result = await db.query<Record<string, unknown>>(
		`SELECT
			e.*,
			p.id AS "parent_id", p.name AS "parent_name", p.tag AS "parent_tag",
			(SELECT COUNT(*)::int FROM "equipment" c WHERE c."parentId" = e.id) AS "childrenCount",
			(SELECT COUNT(*)::int FROM "_EquipmentToWorkOrder" ew WHERE ew."A" = e.id) AS "workOrdersCount"
		 FROM "equipment" e
		 LEFT JOIN "equipment" p ON p.id = e."parentId"
		 WHERE e.id = $1`,
		[id],
	)

	const row = result.rows[0]
	if (!row) {
		return HttpResponse.json({ error: "Equipo no encontrado" }, { status: 404 })
	}

	const attachmentsResult = await db.query<Record<string, unknown>>(
		`SELECT * FROM "attachment" WHERE "equipmentId" = $1`,
		[id],
	)

	return HttpResponse.json({
		id: row.id,
		barcode: row.barcode,
		name: row.name,
		description: row.description,
		isOperational: row.isOperational,
		type: row.type,
		tag: row.tag,
		criticality: row.criticality,
		imageUrl: row.imageUrl,
		locationId: row.locationId,
		parentId: row.parentId,
		createdAt: row.createdAt,
		updatedAt: row.updatedAt,
		parent: row.parent_id
			? { id: row.parent_id, name: row.parent_name, tag: row.parent_tag }
			: null,
		attachments: attachmentsResult.rows,
		_count: {
			children: row.childrenCount ?? 0,
			workOrders: row.workOrdersCount ?? 0,
		},
	})
})

const patchHandler = http.patch("*/api/equipments/:id", async ({ params, request }) => {
	const id = params.id as string
	const body = (await request.json()) as { parentId: string | null }
	const db = await getDemoDb()

	const equipmentResult = await db.query<{ id: string }>(
		`SELECT id FROM "equipment" WHERE id = $1`,
		[id],
	)
	if (equipmentResult.rows.length === 0) {
		return HttpResponse.json(
			{ error: "Equipo no encontrado", code: "NOT_FOUND" },
			{ status: 404 },
		)
	}

	if (body.parentId === id) {
		return HttpResponse.json(
			{ error: "Un equipo no puede ser su propio padre", code: "SELF_REFERENCE" },
			{ status: 400 },
		)
	}

	if (body.parentId) {
		const cycleResult = await db.query<{ would_cycle: boolean }>(
			`WITH RECURSIVE ancestors AS (
				SELECT id, "parentId" FROM "equipment" WHERE id = $1
				UNION ALL
				SELECT e.id, e."parentId" FROM "equipment" e
				JOIN ancestors a ON e.id = a."parentId"
			)
			SELECT EXISTS (SELECT 1 FROM ancestors WHERE id = $2) AS would_cycle`,
			[body.parentId, id],
		)
		if (cycleResult.rows[0]?.would_cycle) {
			return HttpResponse.json(
				{
					error: "Operación no permitida: generaría un ciclo en la jerarquía",
					code: "CYCLE_DETECTED",
				},
				{ status: 409 },
			)
		}
	}

	const now = new Date().toISOString()
	const result = await db.query<Record<string, unknown>>(
		`UPDATE "equipment" SET "parentId" = $1, "updatedAt" = $2 WHERE id = $3 RETURNING *`,
		[body.parentId ?? null, now, id],
	)

	return HttpResponse.json(result.rows[0])
})

const statsHandler = http.get("*/api/equipments/stats", async () => {
	const db = await getDemoDb()

	const totals = await db.query<{
		total: number
		operational: number
		withWO: number
		withoutWO: number
		parents: number
		children: number
	}>(
		`SELECT
			(SELECT COUNT(*)::int FROM "equipment") AS total,
			(SELECT COUNT(*)::int FROM "equipment" WHERE "isOperational" = true) AS operational,
			(SELECT COUNT(*)::int FROM "equipment" e WHERE EXISTS (SELECT 1 FROM "_EquipmentToWorkOrder" ew WHERE ew."A" = e.id)) AS "withWO",
			(SELECT COUNT(*)::int FROM "equipment" e WHERE NOT EXISTS (SELECT 1 FROM "_EquipmentToWorkOrder" ew WHERE ew."A" = e.id)) AS "withoutWO",
			(SELECT COUNT(*)::int FROM "equipment" WHERE "parentId" IS NULL) AS parents,
			(SELECT COUNT(*)::int FROM "equipment" WHERE "parentId" IS NOT NULL) AS children
		`,
	)
	const t = totals.rows[0]!

	const byType = await db.query<{ type: string | null; count: number }>(
		`SELECT type, COUNT(*)::int AS count FROM "equipment"
		 GROUP BY type ORDER BY count DESC LIMIT 5`,
	)
	const byCriticality = await db.query<{ criticality: string | null; count: number }>(
		`SELECT criticality, COUNT(*)::int AS count FROM "equipment" GROUP BY criticality`,
	)
	const woByStatus = await db.query<{ status: string; count: number }>(
		`SELECT status, COUNT(*)::int AS count FROM "work_order"
		 WHERE "deletedAt" IS NULL GROUP BY status`,
	)
	const topEquip = await db.query<{
		id: string
		name: string
		tag: string
		workOrderCount: number
	}>(
		`SELECT e.id, e.name, e.tag,
			(SELECT COUNT(*)::int FROM "_EquipmentToWorkOrder" ew WHERE ew."A" = e.id) AS "workOrderCount"
		 FROM "equipment" e
		 ORDER BY "workOrderCount" DESC LIMIT 5`,
	)

	return HttpResponse.json({
		totalEquipment: t.total,
		operationalEquipment: t.operational,
		equipmentByStatus: [
			{ status: "Con OT", count: t.withWO, fill: "var(--color-emerald-500)" },
			{ status: "Sin OT", count: t.withoutWO, fill: "var(--color-rose-500)" },
		],
		equipmentByType: byType.rows.map((r) => ({
			type: r.type || "Unspecified",
			count: r.count,
		})),
		equipmentByCriticality: byCriticality.rows.map((r) => ({
			criticality: r.criticality || "Unspecified",
			count: r.count,
		})),
		workOrdersByStatus: woByStatus.rows,
		topEquipmentWithWorkOrders: topEquip.rows,
		equipmentHierarchy: {
			parentEquipment: t.parents,
			childEquipment: t.children,
		},
		maintenanceActivityData: [],
	})
})

const workOrdersHandler = http.get(
	"*/api/equipments/:id/work-orders",
	async ({ params, request }) => {
		const id = params.id as string
		const url = new URL(request.url)
		const limit = parseInt(url.searchParams.get("limit") || "5", 10)
		const db = await getDemoDb()

		const result = await db.query<Record<string, unknown>>(
			`SELECT
				wo.id, wo."otNumber", wo.type, wo.status,
				wo."solicitationDate", wo."solicitationTime", wo."programDate",
				wo."estimatedEndDate", wo."workDescription",
				c.id AS "company_id", c.name AS "company_name",
				r.id AS "responsible_id", r.name AS "responsible_name", r.email AS "responsible_email",
				s.id AS "supervisor_id", s.name AS "supervisor_name", s.email AS "supervisor_email"
			 FROM "work_order" wo
			 JOIN "_EquipmentToWorkOrder" ew ON ew."B" = wo.id
			 LEFT JOIN "company" c ON c.id = wo."companyId"
			 LEFT JOIN "user" r ON r.id = wo."responsibleId"
			 LEFT JOIN "user" s ON s.id = wo."supervisorId"
			 WHERE ew."A" = $1 AND wo."deletedAt" IS NULL
			 ORDER BY wo."createdAt" DESC
			 LIMIT $2`,
			[id, limit],
		)

		return HttpResponse.json(
			result.rows.map((r) => ({
				id: r.id,
				otNumber: r.otNumber,
				type: r.type,
				status: r.status,
				solicitationDate: r.solicitationDate,
				solicitationTime: r.solicitationTime,
				programDate: r.programDate,
				estimatedEndDate: r.estimatedEndDate,
				workDescription: r.workDescription,
				company: r.company_id
					? { id: r.company_id, name: r.company_name }
					: null,
				responsible: r.responsible_id
					? { id: r.responsible_id, name: r.responsible_name, email: r.responsible_email }
					: null,
				supervisor: r.supervisor_id
					? { id: r.supervisor_id, name: r.supervisor_name, email: r.supervisor_email }
					: null,
			})),
		)
	},
)

const maintenancePlansHandler = http.get(
	"*/api/equipments/:id/maintenance-plans",
	async ({ params, request }) => {
		const id = params.id as string
		const url = new URL(request.url)
		const limit = parseInt(url.searchParams.get("limit") || "5", 10)
		const db = await getDemoDb()

		const result = await db.query<Record<string, unknown>>(
			`SELECT
				mp.id, mp.name, mp.description, mp."createdAt", mp."updatedAt",
				(SELECT COUNT(*)::int FROM "maintenance_plan_task" t WHERE t."maintenancePlanId" = mp.id) AS "taskCount"
			 FROM "maintenance_plan" mp
			 WHERE mp."equipmentId" = $1
			 ORDER BY mp."createdAt" DESC
			 LIMIT $2`,
			[id, limit],
		)

		return HttpResponse.json(
			result.rows.map((r) => ({
				id: r.id,
				name: r.name,
				description: r.description,
				createdAt: r.createdAt,
				updatedAt: r.updatedAt,
				_count: { task: r.taskCount ?? 0 },
			})),
		)
	},
)

const timelineHandler = http.get(
	"*/api/equipments/:id/timeline",
	async ({ params, request }) => {
		const id = params.id as string
		const url = new URL(request.url)
		const limit = parseInt(url.searchParams.get("limit") || "100", 10)
		const db = await getDemoDb()

		const equipResult = await db.query<{ id: string }>(
			`SELECT id FROM "equipment" WHERE id = $1`,
			[id],
		)
		if (equipResult.rows.length === 0) {
			return HttpResponse.json({ error: "Equipo no encontrado" }, { status: 404 })
		}

		const wrResult = await db.query<Record<string, unknown>>(
			`SELECT
				wr.id, wr."requestNumber", wr.description, wr."isUrgent",
				wr."requestDate", wr.status,
				u.id AS "operator_id", u.name AS "operator_name"
			 FROM "work_request" wr
			 JOIN "_EquipmentToWorkRequest" ewr ON ewr."B" = wr.id
			 LEFT JOIN "user" u ON u.id = wr."operatorId"
			 WHERE ewr."A" = $1
			 ORDER BY wr."requestDate" DESC, wr.id DESC
			 LIMIT $2`,
			[id, limit + 1],
		)

		const woResult = await db.query<Record<string, unknown>>(
			`SELECT
				wo.id, wo."otNumber", wo."workRequest", wo."workDescription",
				wo.type, wo.status, wo.priority, wo.capex,
				wo."solicitationDate", wo."workRequestId", wo."maintenancePlanTaskId",
				mpt.id AS "plan_task_id", mpt.name AS "plan_task_name",
				r.id AS "responsible_id", r.name AS "responsible_name",
				(SELECT COUNT(*)::int FROM "work_order_milestone" m WHERE m."workOrderId" = wo.id) AS "milestonesCount",
				(SELECT COUNT(*)::int FROM "work_book_entry" wbe WHERE wbe."workOrderId" = wo.id) AS "workEntriesCount"
			 FROM "work_order" wo
			 JOIN "_EquipmentToWorkOrder" ew ON ew."B" = wo.id
			 LEFT JOIN "maintenance_plan_task" mpt ON mpt.id = wo."maintenancePlanTaskId"
			 LEFT JOIN "user" r ON r.id = wo."responsibleId"
			 WHERE ew."A" = $1 AND wo."deletedAt" IS NULL
			 ORDER BY wo."solicitationDate" DESC, wo.id DESC
			 LIMIT $2`,
			[id, limit + 1],
		)

		const wrEvents = wrResult.rows.map((r) => ({
			id: r.id as string,
			type: "WORK_REQUEST",
			date: new Date(r.requestDate as string).toISOString(),
			title: r.description as string,
			parentWorkRequestId: null,
			parentPlanTaskId: null,
			planName: null,
			responsible: r.operator_id
				? { id: r.operator_id as string, name: (r.operator_name as string) ?? "" }
				: null,
			status: r.status,
			workRequestNumber: r.requestNumber,
			isUrgent: r.isUrgent,
			workOrderType: null,
			capex: null,
			counts: null,
		}))

		const woEvents = woResult.rows.map((r) => ({
			id: r.id as string,
			type: "WORK_ORDER",
			date: new Date(r.solicitationDate as string).toISOString(),
			title: (r.workDescription as string) ?? (r.workRequest as string),
			parentWorkRequestId: r.workRequestId ?? null,
			parentPlanTaskId: r.maintenancePlanTaskId ?? null,
			planName: r.plan_task_name ?? null,
			responsible: r.responsible_id
				? { id: r.responsible_id as string, name: (r.responsible_name as string) ?? "" }
				: null,
			status: r.status,
			otNumber: r.otNumber,
			workOrderType: r.type,
			priority: r.priority,
			capex: r.capex ?? null,
			counts: {
				milestones: r.milestonesCount ?? 0,
				workEntries: r.workEntriesCount ?? 0,
				inspections: 0,
			},
		}))

		const merged = [...wrEvents, ...woEvents].sort((a, b) => {
			const diff = new Date(b.date).getTime() - new Date(a.date).getTime()
			if (diff !== 0) return diff
			return b.id > a.id ? 1 : -1
		})

		const hasMore = merged.length > limit
		const events = hasMore ? merged.slice(0, limit) : merged
		const last = events[events.length - 1]
		const nextCursor = hasMore && last ? `${last.date}|${last.id}` : null

		return HttpResponse.json({ events, nextCursor, hasMore })
	},
)

export const equipmentHandlers = [
	statsHandler,
	workOrdersHandler,
	maintenancePlansHandler,
	timelineHandler,
	detailHandler,
	patchHandler,
	listHandler,
]
