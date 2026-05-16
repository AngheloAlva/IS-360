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

	const workOrders = await query(
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
			wo."programDate"
		 FROM work_order wo
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
			...wo,
			company: null,
			supervisor: null,
			_count: { milestones: 0, workBookEntries: 0 },
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

	const avgProgress =
		(await scalar<number>(
			`SELECT COALESCE(AVG(progress), 0)::float AS value
			 FROM work_order WHERE "deletedAt" IS NULL AND progress IS NOT NULL`
		)) ?? 0

	const recentWorkOrders = await query(
		`SELECT id, "otNumber", status, priority, "createdAt", "workBookName", progress
		 FROM work_order WHERE "deletedAt" IS NULL
		 ORDER BY "createdAt" DESC LIMIT 10`
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
			companies: [] as Array<{ name: string; value: number }>,
			monthly: monthlyRows,
			averageProgress: Math.round(avgProgress * 100) / 100,
		},
		recentWorkOrders: recentWorkOrders.map((wo) => ({ ...wo, company: null })),
	})
})

// ─── /api/work-order/[id]/details ────────────────────────────────────────────

const detailsHandler = http.get("*/api/work-order/:id/details", async ({ params }) => {
	const id = params.id as string
	const rows = await query(
		`SELECT
			id, "otNumber", "solicitationDate", type, status, capex, "solicitationTime",
			"workRequest", "workDescription", progress, priority, "createdAt", "programDate",
			"estimatedHours", "estimatedDays", "estimatedEndDate", "rescheduledEndDate"
		 FROM work_order WHERE id = $1 AND "deletedAt" IS NULL`,
		[id]
	)
	const wo = rows[0]
	if (!wo) return new HttpResponse("Orden de trabajo no encontrada", { status: 404 })

	return HttpResponse.json({
		...wo,
		initReport: null,
		endReport: null,
		equipments: [],
		company: null,
		supervisor: null,
		responsible: null,
		_count: { workBookEntries: 0 },
		workRequested: null,
		milestones: [],
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
