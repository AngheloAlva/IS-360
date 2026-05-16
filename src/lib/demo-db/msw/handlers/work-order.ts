import { http, HttpResponse } from "msw"

import { getDemoDb } from "@/lib/demo-db/client"

type Row = Record<string, unknown>

async function query<T = Row>(sql: string, params: unknown[] = []): Promise<T[]> {
	const db = await getDemoDb()
	const result = await db.query<T>(sql, params)
	return result.rows
}

async function scalar<T = unknown>(sql: string, params: unknown[] = []): Promise<T | null> {
	const rows = await query<{ value: T }>(sql, params)
	return rows[0]?.value ?? null
}

const TYPE_COLORS: Record<string, string> = {
	PREVENTIVE: "var(--color-orange-500)",
	PREDICTIVE: "var(--color-yellow-500)",
	PROACTIVE: "var(--color-amber-500)",
	CORRECTIVE: "var(--color-red-500)",
}

// ─── /api/work-order (list) ──────────────────────────────────────────────────

const listHandler = http.get("*/api/work-order", async ({ request }) => {
	const url = new URL(request.url)
	const page = parseInt(url.searchParams.get("page") || "1", 10)
	const limit = parseInt(url.searchParams.get("limit") || "10", 10)
	const skip = (page - 1) * limit

	const total = (await scalar<number>(
		`SELECT COUNT(*)::int AS value FROM work_order WHERE "deletedAt" IS NULL`
	)) ?? 0

	const workOrders = await query<Record<string, unknown>>(
		`SELECT
			wo.id,
			wo."otNumber",
			wo."workRequest",
			wo.progress,
			wo.status,
			wo."solicitationDate",
			wo."estimatedEndDate",
			wo."rescheduledEndDate",
			wo."estimatedHours",
			wo."estimatedDays",
			wo.type,
			wo.priority,
			wo."programDate",
			c.id AS "c_id", c.name AS "c_name", c.image AS "c_image", c.rut AS "c_rut",
			s.id AS "s_id", s.name AS "s_name", s.email AS "s_email", s.image AS "s_image",
			(SELECT COUNT(*)::int FROM milestone WHERE "workOrderId" = wo.id) AS "ms_count",
			(SELECT COUNT(*)::int FROM work_book_entry WHERE "workOrderId" = wo.id) AS "wbe_count"
		 FROM work_order wo
		 LEFT JOIN "company" c ON c.id = wo."companyId"
		 LEFT JOIN "user" s ON s.id = wo."supervisorId"
		 WHERE wo."deletedAt" IS NULL
		 ORDER BY wo."createdAt" DESC
		 LIMIT $1 OFFSET $2`,
		[limit, skip]
	)

	const [activeCount, completedCount, avgProgress] = await Promise.all([
		scalar<number>(
			`SELECT COUNT(*)::int AS value FROM work_order
			 WHERE "deletedAt" IS NULL AND status IN ('IN_PROGRESS', 'PENDING')`
		),
		scalar<number>(
			`SELECT COUNT(*)::int AS value FROM work_order
			 WHERE "deletedAt" IS NULL AND status = 'COMPLETED'`
		),
		scalar<{ _avg: { progress: number | null } }>(
			`SELECT json_build_object('_avg', json_build_object('progress', AVG(progress))) AS value
			 FROM work_order WHERE "deletedAt" IS NULL`
		),
	])

	return HttpResponse.json({
		workOrders: workOrders.map((wo) => ({
			id: wo.id,
			otNumber: wo.otNumber,
			workRequest: wo.workRequest,
			progress: wo.progress,
			status: wo.status,
			solicitationDate: wo.solicitationDate,
			estimatedEndDate: wo.estimatedEndDate,
			rescheduledEndDate: wo.rescheduledEndDate,
			estimatedHours: wo.estimatedHours,
			estimatedDays: wo.estimatedDays,
			type: wo.type,
			priority: wo.priority,
			programDate: wo.programDate,
			company: wo.c_id
				? { id: wo.c_id, name: wo.c_name, rut: wo.c_rut, image: wo.c_image ?? null }
				: null,
			supervisor: wo.s_id
				? { id: wo.s_id, name: wo.s_name, email: wo.s_email, image: wo.s_image ?? null }
				: null,
			_count: {
				milestones: (wo.ms_count as number) ?? 0,
				workBookEntries: (wo.wbe_count as number) ?? 0,
			},
		})),
		total,
		pages: Math.max(1, Math.ceil(total / limit)),
		stats: {
			activeCount: activeCount ?? 0,
			completedCount: completedCount ?? 0,
			totalEntries: avgProgress ?? { _avg: { progress: null } },
		},
	})
})

// ─── /api/work-order/stats ───────────────────────────────────────────────────

const statsHandler = http.get("*/api/work-order/stats", async () => {
	const total =
		(await scalar<number>(
			`SELECT COUNT(*)::int AS value FROM work_order WHERE "deletedAt" IS NULL`
		)) ?? 0

	const statusRows = await query<{ status: string; count: number }>(
		`SELECT status, COUNT(*)::int AS count
		 FROM work_order WHERE "deletedAt" IS NULL GROUP BY status`
	)
	const statusCounts: Record<string, number> = Object.fromEntries(
		statusRows.map((r) => [r.status, r.count])
	)

	const priorityRows = await query<{ name: string; value: number }>(
		`SELECT priority AS name, COUNT(*)::int AS value
		 FROM work_order WHERE "deletedAt" IS NULL GROUP BY priority`
	)

	const typeRows = await query<{ name: string; value: number }>(
		`SELECT type AS name, COUNT(*)::int AS value
		 FROM work_order WHERE "deletedAt" IS NULL GROUP BY type`
	)

	const monthlyRows = await query<{ month: number; count: number }>(
		`SELECT EXTRACT(MONTH FROM "createdAt")::int AS month, COUNT(*)::int AS count
		 FROM work_order
		 WHERE "createdAt" >= DATE_TRUNC('year', CURRENT_DATE)
		 GROUP BY month ORDER BY month ASC`
	)

	const companyRows = await query<{ name: string; value: number }>(
		`SELECT COALESCE(c.name, 'Interno') AS name, COUNT(wo.id)::int AS value
		 FROM work_order wo
		 LEFT JOIN "company" c ON c.id = wo."companyId"
		 WHERE wo."deletedAt" IS NULL
		 GROUP BY c.name
		 ORDER BY value DESC`
	)

	const avgProgress =
		(await scalar<number>(
			`SELECT COALESCE(AVG(progress), 0)::float AS value
			 FROM work_order WHERE "deletedAt" IS NULL AND progress IS NOT NULL`
		)) ?? 0

	const recentWorkOrders = await query<Record<string, unknown>>(
		`SELECT wo.id, wo."otNumber", wo.status, wo.priority, wo."createdAt", wo."workBookName", wo.progress,
			c.id AS "c_id", c.name AS "c_name", c.image AS "c_image"
		 FROM work_order wo
		 LEFT JOIN "company" c ON c.id = wo."companyId"
		 WHERE wo."deletedAt" IS NULL
		 ORDER BY wo."createdAt" DESC LIMIT 10`
	)

	return HttpResponse.json({
		cards: {
			total,
			planned: statusCounts.PLANNED ?? 0,
			inProgress: statusCounts.IN_PROGRESS ?? 0,
			completed: statusCounts.COMPLETED ?? 0,
		},
		charts: {
			priority: priorityRows,
			type: typeRows.map((t) => ({ ...t, fill: TYPE_COLORS[t.name] ?? "var(--color-gray-500)" })),
			companies: companyRows,
			monthly: monthlyRows,
			averageProgress: Math.round(avgProgress * 100) / 100,
		},
		recentWorkOrders: recentWorkOrders.map((wo) => ({
			id: wo.id,
			otNumber: wo.otNumber,
			status: wo.status,
			priority: wo.priority,
			createdAt: wo.createdAt,
			workBookName: wo.workBookName,
			progress: wo.progress,
			company: wo.c_id
				? { id: wo.c_id, name: wo.c_name, image: wo.c_image ?? null }
				: null,
		})),
	})
})

// ─── /api/work-order/[id]/details ────────────────────────────────────────────

const detailsHandler = http.get("*/api/work-order/:id/details", async ({ params }) => {
	const id = params.id as string
	const rows = await query<Record<string, unknown>>(
		`SELECT
			wo.id, wo."otNumber", wo."solicitationDate", wo.type, wo.status, wo.capex, wo."solicitationTime",
			wo."workRequest", wo."workDescription", wo.progress, wo.priority, wo."createdAt", wo."programDate",
			wo."estimatedHours", wo."estimatedDays", wo."estimatedEndDate", wo."rescheduledEndDate",
			c.id AS "companyId", c.name AS "companyName", c.image AS "companyImage",
			s.id AS "supervisorIdRow", s.name AS "supervisorName", s.email AS "supervisorEmail",
			r.id AS "responsibleIdRow", r.name AS "responsibleName", r.email AS "responsibleEmail"
		 FROM work_order wo
		 LEFT JOIN "company" c ON c.id = wo."companyId"
		 LEFT JOIN "user" s ON s.id = wo."supervisorId"
		 LEFT JOIN "user" r ON r.id = wo."responsibleId"
		 WHERE wo.id = $1 AND wo."deletedAt" IS NULL`,
		[id]
	)
	const wo = rows[0]
	if (!wo) return new HttpResponse("Orden de trabajo no encontrada", { status: 404 })

	const equipments = await query<Record<string, unknown>>(
		`SELECT e.id, e.name, e.tag, e.barcode, e.type, e."isOperational", e.criticality
		 FROM equipment e
		 JOIN "_EquipmentToWorkOrder" j ON j."A" = e.id
		 WHERE j."B" = $1`,
		[id]
	)

	const entryCount = (await scalar<number>(
		`SELECT COUNT(*)::int AS value FROM work_book_entry WHERE "workOrderId" = $1`,
		[id]
	)) ?? 0

	const milestones = await query<Record<string, unknown>>(
		`SELECT id, name, status, "order", "isCompleted", weight, "startDate", "endDate"
		 FROM milestone WHERE "workOrderId" = $1 ORDER BY "order" ASC`,
		[id]
	)

	return HttpResponse.json({
		id: wo.id,
		otNumber: wo.otNumber,
		solicitationDate: wo.solicitationDate,
		solicitationTime: wo.solicitationTime,
		type: wo.type,
		status: wo.status,
		capex: wo.capex,
		workRequest: wo.workRequest,
		workDescription: wo.workDescription,
		progress: wo.progress,
		priority: wo.priority,
		createdAt: wo.createdAt,
		programDate: wo.programDate,
		estimatedHours: wo.estimatedHours,
		estimatedDays: wo.estimatedDays,
		estimatedEndDate: wo.estimatedEndDate,
		rescheduledEndDate: wo.rescheduledEndDate,
		initReport: null,
		endReport: null,
		equipments,
		company: wo.companyId
			? { id: wo.companyId, name: wo.companyName, image: wo.companyImage ?? null }
			: null,
		supervisor: wo.supervisorIdRow
			? { id: wo.supervisorIdRow, name: wo.supervisorName, email: wo.supervisorEmail }
			: { id: "", name: "—", email: "" },
		responsible: wo.responsibleIdRow
			? { id: wo.responsibleIdRow, name: wo.responsibleName, email: wo.responsibleEmail }
			: { id: "", name: "—", email: "" },
		_count: { workBookEntries: entryCount },
		workRequested: null,
		milestones,
	})
})

// ─── /api/work-order/[id]/summary ────────────────────────────────────────────

const summaryHandler = http.get("*/api/work-order/:id/summary", async ({ params }) => {
	const id = params.id as string
	const rows = await query<Record<string, unknown>>(
		`SELECT
			id, "otNumber", "workRequest", "workDescription", type, status, priority, capex,
			"programDate", "estimatedEndDate", "solicitationDate", "workRequestId",
			"maintenancePlanTaskId"
		 FROM work_order WHERE id = $1 AND "deletedAt" IS NULL`,
		[id]
	)
	const wo = rows[0]
	if (!wo) return HttpResponse.json({ error: "Orden de trabajo no encontrada" }, { status: 404 })

	const toIso = (v: unknown): string =>
		v instanceof Date ? v.toISOString() : new Date(String(v ?? Date.now())).toISOString()

	return HttpResponse.json({
		id: wo.id,
		otNumber: wo.otNumber,
		workRequest: wo.workRequest,
		workDescription: wo.workDescription ?? null,
		type: wo.type,
		status: wo.status,
		priority: wo.priority,
		capex: wo.capex ?? null,
		programDate: toIso(wo.programDate),
		estimatedEndDate: toIso(wo.estimatedEndDate),
		solicitationDate: toIso(wo.solicitationDate),
		responsible: null,
		supervisor: null,
		workRequested: null,
		maintenancePlanTask: null,
		_count: { milestones: 0, workEntries: 0, inspections: 0 },
		top5: { milestones: [], workEntries: [], inspections: [] },
	})
})

// ─── /api/work-order/with-inspections ────────────────────────────────────────

const withInspectionsHandler = http.get("*/api/work-order/with-inspections", async () => {
	return HttpResponse.json({
		workOrders: [],
		formattedData: [],
		total: 0,
		totalInspections: 0,
	})
})

export const workOrderHandlers = [
	statsHandler,
	withInspectionsHandler,
	detailsHandler,
	summaryHandler,
	listHandler,
]
