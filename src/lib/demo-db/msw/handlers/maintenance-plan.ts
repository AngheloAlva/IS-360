import { http, HttpResponse } from "msw"

import { getDemoDb } from "@/lib/demo-db/client"
import { calculateNextDate } from "@/project/maintenance-plan/utils/calculate-next-date"
import type { PLAN_FREQUENCY } from "@/generated/prisma/enums"

const NEXT_WEEK_MS = 7 * 24 * 60 * 60 * 1000

const listHandler = http.get("*/api/maintenance-plan", async ({ request }) => {
	const url = new URL(request.url)
	const page = parseInt(url.searchParams.get("page") ?? "1", 10)
	const limit = parseInt(url.searchParams.get("limit") ?? "10", 10)
	const search = url.searchParams.get("search") ?? ""
	const includeTasks = url.searchParams.get("includeTasks") === "true"
	const alertFilter = url.searchParams.get("alertFilter") ?? "all"
	const order = url.searchParams.get("order") === "desc" ? "DESC" : "ASC"
	const orderBy = url.searchParams.get("orderBy") === "createdAt" ? '"createdAt"' : "name"
	const skip = (page - 1) * limit

	const db = await getDemoDb()
	const now = new Date()
	const nextWeek = new Date(now.getTime() + NEXT_WEEK_MS)
	const nowIso = now.toISOString()
	const nextWeekIso = nextWeek.toISOString()

	const conditions: string[] = [`mp."isActive" = true`]
	const params: unknown[] = []

	if (search) {
		params.push(`%${search}%`)
		conditions.push(
			`(mp.name ILIKE $${params.length} OR mp.description ILIKE $${params.length} OR EXISTS (SELECT 1 FROM "equipment" e WHERE e.id = mp."equipmentId" AND e.name ILIKE $${params.length}))`,
		)
	}

	if (alertFilter === "withOverdue") {
		params.push(nowIso)
		conditions.push(
			`EXISTS (SELECT 1 FROM "maintenance_plan_task" t WHERE t."maintenancePlanId" = mp.id AND t."isActive" = true AND t."nextDate" < $${params.length})`,
		)
	} else if (alertFilter === "withUpcoming") {
		params.push(nowIso)
		params.push(nextWeekIso)
		conditions.push(
			`EXISTS (SELECT 1 FROM "maintenance_plan_task" t WHERE t."maintenancePlanId" = mp.id AND t."isActive" = true AND t."nextDate" >= $${params.length - 1} AND t."nextDate" <= $${params.length})`,
		)
	} else if (alertFilter === "withAlerts") {
		params.push(nextWeekIso)
		conditions.push(
			`EXISTS (SELECT 1 FROM "maintenance_plan_task" t WHERE t."maintenancePlanId" = mp.id AND t."isActive" = true AND t."nextDate" <= $${params.length})`,
		)
	} else if (alertFilter === "withoutAlerts") {
		params.push(nextWeekIso)
		conditions.push(
			`NOT EXISTS (SELECT 1 FROM "maintenance_plan_task" t WHERE t."maintenancePlanId" = mp.id AND t."isActive" = true AND t."nextDate" <= $${params.length})`,
		)
	}

	const where = `WHERE ${conditions.join(" AND ")}`

	const totalResult = await db.query<{ value: number }>(
		`SELECT COUNT(*)::int AS value FROM "maintenance_plan" mp ${where}`,
		params,
	)
	const total = totalResult.rows[0]?.value ?? 0

	const plansResult = await db.query<Record<string, unknown>>(
		`SELECT
			mp.id, mp.name, mp.slug, mp."createdAt",
			u.id AS "createdBy_id", u.name AS "createdBy_name",
			e.id AS "equipment_id", e.tag AS "equipment_tag", e.name AS "equipment_name",
			l.id AS "location_id", l.name AS "location_name", l.path AS "location_path",
			(SELECT COUNT(*)::int FROM "maintenance_plan_task" t WHERE t."maintenancePlanId" = mp.id AND t."isActive" = true AND t."nextDate" >= $${params.length + 1} AND t."nextDate" <= $${params.length + 2}) AS "nextWeekTasksCount",
			(SELECT COUNT(*)::int FROM "maintenance_plan_task" t WHERE t."maintenancePlanId" = mp.id AND t."isActive" = true AND t."nextDate" < $${params.length + 1}) AS "expiredTasksCount"
		 FROM "maintenance_plan" mp
		 LEFT JOIN "user" u ON u.id = mp."createdById"
		 LEFT JOIN "equipment" e ON e.id = mp."equipmentId"
		 LEFT JOIN "Location" l ON l.id = e."locationId"
		 ${where}
		 ORDER BY ${orderBy === "name" ? "mp.name" : `mp."createdAt"`} ${order}
		 LIMIT ${limit} OFFSET ${skip}`,
		[...params, nowIso, nextWeekIso],
	)

	const plans = await Promise.all(
		plansResult.rows.map(async (row) => {
			const plan = {
				id: row.id,
				name: row.name,
				slug: row.slug,
				createdAt: row.createdAt,
				createdBy: { id: row.createdBy_id, name: row.createdBy_name },
				equipment: {
					id: row.equipment_id,
					tag: row.equipment_tag,
					name: row.equipment_name,
					location: row.location_id
						? { id: row.location_id, name: row.location_name, path: row.location_path }
						: null,
				},
				nextWeekTasksCount: row.nextWeekTasksCount ?? 0,
				expiredTasksCount: row.expiredTasksCount ?? 0,
				task: undefined as unknown,
			}
			if (includeTasks) {
				const tasks = await db.query<Record<string, unknown>>(
					`SELECT t.id, t.name, t."nextDate",
						e.id AS "eq_id", e.name AS "eq_name",
						l.id AS "loc_id", l.name AS "loc_name", l.path AS "loc_path"
					 FROM "maintenance_plan_task" t
					 LEFT JOIN "equipment" e ON e.id = t."equipmentId"
					 LEFT JOIN "Location" l ON l.id = e."locationId"
					 WHERE t."maintenancePlanId" = $1 AND t."isActive" = true`,
					[row.id],
				)
				plan.task = tasks.rows.map((t) => ({
					id: t.id,
					name: t.name,
					nextDate: t.nextDate,
					equipment: t.eq_id ? { id: t.eq_id, name: t.eq_name } : null,
					equipments: t.eq_id
						? [
								{
									id: t.eq_id,
									name: t.eq_name,
									location: t.loc_id
										? { id: t.loc_id, name: t.loc_name, path: t.loc_path }
										: null,
								},
							]
						: [],
				}))
			}
			return plan
		}),
	)

	return HttpResponse.json({
		total,
		maintenancePlans: plans,
		pages: Math.ceil(total / limit),
	})
})

const planTasksHandler = http.get(
	"*/api/maintenance-plan/:planSlug/tasks",
	async ({ params, request }) => {
		const slug = params.planSlug as string
		const url = new URL(request.url)
		const page = parseInt(url.searchParams.get("page") ?? "1", 10)
		const limit = parseInt(url.searchParams.get("limit") ?? "10", 10)
		const search = url.searchParams.get("search") ?? ""
		const frequency = url.searchParams.get("frequency") ?? ""
		const isAutomated = url.searchParams.get("isAutomated") ?? "all"
		const order = url.searchParams.get("order") === "desc" ? "DESC" : "ASC"

		const db = await getDemoDb()
		const planResult = await db.query<{ id: string }>(
			`SELECT id FROM "maintenance_plan" WHERE slug = $1 AND "isActive" = true`,
			[slug],
		)
		const plan = planResult.rows[0]
		if (!plan) {
			return HttpResponse.json({ message: "Plan no encontrado", status: 404 })
		}

		const conditions: string[] = [`t."maintenancePlanId" = $1`, `t."isActive" = true`]
		const queryParams: unknown[] = [plan.id]

		if (search) {
			queryParams.push(`%${search}%`)
			conditions.push(`(t.name ILIKE $${queryParams.length} OR t.description ILIKE $${queryParams.length})`)
		}
		if (frequency) {
			queryParams.push(frequency)
			conditions.push(`t.frequency = $${queryParams.length}`)
		}
		if (isAutomated === "automated") conditions.push(`t."isAutomated" = true`)
		if (isAutomated === "manual") conditions.push(`t."isAutomated" = false`)

		const where = `WHERE ${conditions.join(" AND ")}`
		const skip = (page - 1) * limit

		const totalResult = await db.query<{ value: number }>(
			`SELECT COUNT(*)::int AS value FROM "maintenance_plan_task" t ${where}`,
			queryParams,
		)
		const total = totalResult.rows[0]?.value ?? 0

		const tasksResult = await db.query<Record<string, unknown>>(
			`SELECT
				t.id, t.name, t.slug, t."nextDate", t."createdAt", t.frequency,
				t.specialty, t."taskType", t.description, t."emailsForCopy",
				t."isAutomated", t."automatedCompanyId", t."automatedResponsibleId",
				t."automatedSupervisorId", t."automatedWorkOrderType", t."automatedPriority",
				t."automatedCapex", t."automatedEstimatedDays", t."automatedEstimatedDaysByMonth",
				t."automatedEstimatedHours", t."automatedDaysInAdvance", t."automatedWorkDescription",
				t."blockIfPreviousNotCompleted",
				e.id AS "eq_id", e.tag AS "eq_tag", e.name AS "eq_name",
				l.id AS "loc_id", l.name AS "loc_name", l.path AS "loc_path",
				u.id AS "createdBy_id", u.name AS "createdBy_name",
				(SELECT COUNT(*)::int FROM "work_order" wo WHERE wo."maintenancePlanTaskId" = t.id AND wo."deletedAt" IS NULL) AS "workOrdersCount"
			 FROM "maintenance_plan_task" t
			 LEFT JOIN "equipment" e ON e.id = t."equipmentId"
			 LEFT JOIN "Location" l ON l.id = e."locationId"
			 LEFT JOIN "user" u ON u.id = t."createdById"
			 ${where}
			 ORDER BY t."createdAt" ${order}
			 LIMIT ${limit} OFFSET ${skip}`,
			queryParams,
		)

		const tasks = await Promise.all(
			tasksResult.rows.map(async (row) => {
				const extraEq = await db.query<Record<string, unknown>>(
					`SELECT e.id, e.tag, e.name,
						l.id AS "loc_id", l.name AS "loc_name", l.path AS "loc_path"
					 FROM "_MaintenancePlanTaskEquipments" mte
					 JOIN "equipment" e ON e.id = mte."A"
					 LEFT JOIN "Location" l ON l.id = e."locationId"
					 WHERE mte."B" = $1`,
					[row.id],
				)
				const equipments = extraEq.rows.length
					? extraEq.rows.map((e) => ({
							id: e.id,
							tag: e.tag,
							name: e.name,
							location: e.loc_id
								? { id: e.loc_id, name: e.loc_name, path: e.loc_path }
								: null,
						}))
					: row.eq_id
						? [
								{
									id: row.eq_id,
									tag: row.eq_tag,
									name: row.eq_name,
									location: row.loc_id
										? { id: row.loc_id, name: row.loc_name, path: row.loc_path }
										: null,
								},
							]
						: []
				const primaryEquipment = equipments[0] ?? null
				return {
					id: row.id,
					name: row.name,
					slug: row.slug,
					nextDate: row.nextDate,
					createdAt: row.createdAt,
					frequency: row.frequency,
					specialty: row.specialty,
					taskType: row.taskType,
					description: row.description,
					emailsForCopy: row.emailsForCopy,
					automatedDaysInAdvance: row.automatedDaysInAdvance,
					equipment: primaryEquipment,
					equipments,
					createdBy: row.createdBy_id
						? { id: row.createdBy_id, name: row.createdBy_name }
						: null,
					attachments: [],
					isAutomated: row.isAutomated,
					automatedCompanyId: row.automatedCompanyId,
					automatedResponsibleId: row.automatedResponsibleId,
					automatedSupervisorId: row.automatedSupervisorId,
					automatedWorkOrderType: row.automatedWorkOrderType,
					automatedPriority: row.automatedPriority,
					automatedCapex: row.automatedCapex,
					automatedEstimatedDays: row.automatedEstimatedDays,
					automatedEstimatedDaysByMonth: row.automatedEstimatedDaysByMonth,
					automatedEstimatedHours: row.automatedEstimatedHours,
					automatedWorkDescription: row.automatedWorkDescription,
					blockIfPreviousNotCompleted: row.blockIfPreviousNotCompleted,
					_count: { workOrders: row.workOrdersCount ?? 0 },
				}
			}),
		)

		return HttpResponse.json({ tasks, total, pages: Math.ceil(total / limit) })
	},
)

const planStatsHandler = http.get(
	"*/api/maintenance-plan/:planSlug/stats",
	async ({ params }) => {
		const slug = params.planSlug as string
		const db = await getDemoDb()
		const plan = await db.query<{ id: string }>(
			`SELECT id FROM "maintenance_plan" WHERE slug = $1`,
			[slug],
		)
		const planId = plan.rows[0]?.id
		if (!planId) {
			return HttpResponse.json({ message: "Plan no encontrado" }, { status: 404 })
		}

		const counts = await db.query<{
			total: number
			active: number
			automated: number
			overdue: number
		}>(
			`SELECT
				(SELECT COUNT(*)::int FROM "maintenance_plan_task" WHERE "maintenancePlanId" = $1) AS total,
				(SELECT COUNT(*)::int FROM "maintenance_plan_task" WHERE "maintenancePlanId" = $1 AND "isActive" = true) AS active,
				(SELECT COUNT(*)::int FROM "maintenance_plan_task" WHERE "maintenancePlanId" = $1 AND "isAutomated" = true) AS automated,
				(SELECT COUNT(*)::int FROM "maintenance_plan_task" WHERE "maintenancePlanId" = $1 AND "isActive" = true AND "nextDate" < NOW()) AS overdue`,
			[planId],
		)
		return HttpResponse.json(counts.rows[0] ?? { total: 0, active: 0, automated: 0, overdue: 0 })
	},
)

const planTaskWorkOrdersHandler = http.get(
	"*/api/maintenance-plan/:planSlug/tasks/:taskId/work-orders",
	async ({ params }) => {
		const taskId = params.taskId as string
		const db = await getDemoDb()
		const result = await db.query<Record<string, unknown>>(
			`SELECT id, "otNumber", status, type, priority, "programDate", "endDate", "createdAt"
			 FROM "work_order"
			 WHERE "maintenancePlanTaskId" = $1 AND "deletedAt" IS NULL
			 ORDER BY "programDate" DESC`,
			[taskId],
		)
		return HttpResponse.json(result.rows)
	},
)

const statsHandler = http.get("*/api/maintenance-plan/stats", async () => {
	const db = await getDemoDb()
	const counts = await db.query<{
		totalPlans: number
		totalTasks: number
		upcoming: number
		overdue: number
	}>(
		`SELECT
			(SELECT COUNT(*)::int FROM "maintenance_plan" WHERE "isActive" = true) AS "totalPlans",
			(SELECT COUNT(*)::int FROM "maintenance_plan_task" t WHERE t."isActive" = true
				AND EXISTS (SELECT 1 FROM "maintenance_plan" p WHERE p.id = t."maintenancePlanId" AND p."isActive" = true)) AS "totalTasks",
			(SELECT COUNT(*)::int FROM "maintenance_plan_task" t WHERE t."isActive" = true
				AND t."nextDate" >= NOW() AND t."nextDate" <= NOW() + INTERVAL '1 month') AS upcoming,
			(SELECT COUNT(*)::int FROM "maintenance_plan_task" t WHERE t."isActive" = true
				AND t."nextDate" < NOW()) AS overdue`,
	)
	const byFreq = await db.query<{ frequency: string; count: number }>(
		`SELECT frequency, COUNT(*)::int AS count FROM "maintenance_plan_task"
		 WHERE "isActive" = true GROUP BY frequency`,
	)
	return HttpResponse.json({
		...counts.rows[0],
		tasksByFrequency: byFreq.rows.map((r) => ({
			name: r.frequency,
			value: r.count,
			frequency: r.frequency,
		})),
		pieChartData: byFreq.rows.map((r) => ({
			name: r.frequency,
			value: r.count,
			frequency: r.frequency,
		})),
	})
})

const kpiHandler = http.get("*/api/maintenance-plan/kpi", async () => {
	const db = await getDemoDb()
	const totals = await db.query<{ total: number; completed: number; pending: number }>(
		`SELECT
			(SELECT COUNT(*)::int FROM "work_order" WHERE "maintenancePlanTaskId" IS NOT NULL AND "deletedAt" IS NULL) AS total,
			(SELECT COUNT(*)::int FROM "work_order" WHERE "maintenancePlanTaskId" IS NOT NULL AND status = 'COMPLETED' AND "deletedAt" IS NULL) AS completed,
			(SELECT COUNT(*)::int FROM "work_order" WHERE "maintenancePlanTaskId" IS NOT NULL AND status <> 'COMPLETED' AND "deletedAt" IS NULL) AS pending`,
	)
	const t = totals.rows[0] ?? { total: 0, completed: 0, pending: 0 }
	const compliance = t.total === 0 ? 0 : Math.round((t.completed / t.total) * 100)
	return HttpResponse.json({
		complianceRate: compliance,
		totalWorkOrders: t.total,
		completedWorkOrders: t.completed,
		pendingWorkOrders: t.pending,
		monthlyTrend: [],
		topPlans: [],
	})
})

const kpiDrillDownHandler = http.get(
	"*/api/maintenance-plan/kpi/drill-down",
	async () => HttpResponse.json({ rows: [] }),
)

const kpiExportHandler = http.get(
	"*/api/maintenance-plan/kpi/export",
	async () =>
		HttpResponse.json(
			{ error: "Export no disponible en demo" },
			{ status: 501 },
		),
)

const scheduleHandler = http.get(
	"*/api/maintenance-plan/schedule",
	async ({ request }) => {
		const url = new URL(request.url)
		const startMonth = parseInt(url.searchParams.get("startMonth") ?? "1", 10)
		const startYear = parseInt(
			url.searchParams.get("startYear") ?? String(new Date().getFullYear()),
			10,
		)
		const rangeMonths = parseInt(url.searchParams.get("rangeMonths") ?? "12", 10)

		const rangeStart = new Date(startYear, startMonth - 1, 1)
		const rangeEnd = new Date(startYear, startMonth - 1 + rangeMonths, 0, 23, 59, 59, 999)

		const monthLabels = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
		const months: Array<{ month: number; year: number; daysInMonth: number; label: string }> = []
		for (let i = 0; i < rangeMonths; i++) {
			const d = new Date(rangeStart.getFullYear(), rangeStart.getMonth() + i, 1)
			const m = d.getMonth() + 1
			const y = d.getFullYear()
			const daysInMonth = new Date(y, m, 0).getDate()
			months.push({ month: m, year: y, daysInMonth, label: `${monthLabels[m - 1]} ${y}` })
		}

		const db = await getDemoDb()
		const tasksResult = await db.query<Record<string, unknown>>(
			`SELECT
				t.id, t.name, t.slug, t."nextDate", t.frequency, t.specialty, t."taskType",
				t."originalDayOfMonth", t."isAutomated", t."automatedDaysInAdvance",
				e.id AS "eq_id", e.name AS "eq_name", e.tag AS "eq_tag",
				l.id AS "loc_id", l.name AS "loc_name", l.path AS "loc_path", l."parentId" AS "loc_parent",
				mp.name AS "plan_name", mp.slug AS "plan_slug"
			 FROM "maintenance_plan_task" t
			 LEFT JOIN "equipment" e ON e.id = t."equipmentId"
			 LEFT JOIN "Location" l ON l.id = e."locationId"
			 JOIN "maintenance_plan" mp ON mp.id = t."maintenancePlanId"
			 WHERE t."isActive" = true AND mp."isActive" = true
			 ORDER BY mp.name ASC, t.name ASC`,
		)

		const NO_LOC_ID = "__no_location__"
		const NO_LOC_NAME = "Sin ubicación"

		const woResult = await db.query<{
			id: string
			otNumber: string
			status: string
			programDate: string
			endDate: string | null
			maintenancePlanTaskId: string
		}>(
			`SELECT id, "otNumber", status, "programDate", "endDate", "maintenancePlanTaskId"
			 FROM "work_order"
			 WHERE "maintenancePlanTaskId" IS NOT NULL
			   AND "deletedAt" IS NULL
			   AND ("programDate" BETWEEN $1 AND $2 OR status = 'COMPLETED')
			 ORDER BY "programDate" DESC`,
			[rangeStart.toISOString(), rangeEnd.toISOString()],
		)
		const wosByTask = new Map<string, typeof woResult.rows>()
		for (const wo of woResult.rows) {
			const arr = wosByTask.get(wo.maintenancePlanTaskId) ?? []
			arr.push(wo)
			wosByTask.set(wo.maintenancePlanTaskId, arr)
		}

		const tasksByLocationId: Record<string, unknown[]> = {}
		const usedLocationIds = new Set<string>()
		const locationsMap = new Map<string, { id: string; name: string; parentId: string | null }>()

		for (const row of tasksResult.rows) {
			const locationId = (row.loc_id as string) ?? NO_LOC_ID
			const taskWos = wosByTask.get(row.id as string) ?? []
			const completed = taskWos.filter((wo) => wo.status === "COMPLETED")
			const lastCompleted = completed.sort((a, b) => {
				const at = a.endDate ? new Date(a.endDate).getTime() : 0
				const bt = b.endDate ? new Date(b.endDate).getTime() : 0
				return bt - at
			})[0]

			const workOrdersInRange = taskWos
				.filter((wo) => {
					const d = new Date(wo.programDate)
					return d >= rangeStart && d <= rangeEnd
				})
				.map((wo) => {
					const d = new Date(wo.programDate)
					return {
						otNumber: wo.otNumber,
						status: wo.status,
						month: d.getMonth() + 1,
						year: d.getFullYear(),
						day: d.getDate(),
					}
				})

			const scheduledDates: Array<{ month: number; year: number; day: number }> = []
			let cursor = new Date(row.nextDate as string)
			if (cursor <= rangeEnd) {
				let iterations = 0
				while (cursor <= rangeEnd && iterations < 500) {
					if (cursor >= rangeStart) {
						scheduledDates.push({
							month: cursor.getMonth() + 1,
							year: cursor.getFullYear(),
							day: cursor.getDate(),
						})
					}
					cursor = calculateNextDate(
						cursor,
						row.frequency as PLAN_FREQUENCY,
						(row.originalDayOfMonth as number | null) ?? undefined,
					)
					iterations++
				}
			}

			if (scheduledDates.length === 0 && workOrdersInRange.length === 0) continue

			const taskRow = {
				id: row.id,
				slug: row.slug,
				name: row.name,
				planName: row.plan_name,
				planSlug: row.plan_slug,
				frequency: row.frequency,
				specialty: row.specialty,
				taskType: row.taskType,
				nextDate: row.nextDate,
				isAutomated: row.isAutomated,
				automatedDaysInAdvance: row.automatedDaysInAdvance ?? 5,
				locationId,
				location: (row.loc_path as string) ?? NO_LOC_NAME,
				equipmentName: (row.eq_name as string) ?? "",
				lastCompleted: lastCompleted?.endDate ?? null,
				lastCompletedOt: lastCompleted?.otNumber ?? null,
				scheduledDates,
				workOrdersInRange,
			}
			usedLocationIds.add(locationId)
			if (!tasksByLocationId[locationId]) tasksByLocationId[locationId] = []
			tasksByLocationId[locationId].push(taskRow)
			if (row.loc_id) {
				locationsMap.set(row.loc_id as string, {
					id: row.loc_id as string,
					name: row.loc_name as string,
					parentId: (row.loc_parent as string) ?? null,
				})
			}
		}

		// Walk up ancestors so the tree stays connected
		let pending: string[] = Array.from(locationsMap.values())
			.map((l) => l.parentId)
			.filter((id): id is string => id !== null && !locationsMap.has(id))
		while (pending.length > 0) {
			const ancestors = await db.query<{
				id: string
				name: string
				parentId: string | null
			}>(`SELECT id, name, "parentId" FROM "Location" WHERE id = ANY($1::text[])`, [pending])
			for (const loc of ancestors.rows) locationsMap.set(loc.id, loc)
			pending = ancestors.rows
				.map((l) => l.parentId)
				.filter((id): id is string => id !== null && !locationsMap.has(id))
		}

		const locations: Array<{ id: string; name: string; parentId: string | null }> = Array.from(
			locationsMap.values(),
		)
		if (usedLocationIds.has(NO_LOC_ID)) {
			locations.push({ id: NO_LOC_ID, name: NO_LOC_NAME, parentId: null })
		}

		return HttpResponse.json({
			months,
			startMonth,
			startYear,
			rangeMonths,
			locations,
			tasksByLocationId,
		})
	},
)

export const maintenancePlanHandlers = [
	scheduleHandler,
	statsHandler,
	kpiExportHandler,
	kpiDrillDownHandler,
	kpiHandler,
	planTaskWorkOrdersHandler,
	planStatsHandler,
	planTasksHandler,
	listHandler,
]
