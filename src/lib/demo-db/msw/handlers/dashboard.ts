import { http, HttpResponse } from "msw"

import { getDemoDb } from "@/lib/demo-db/client"

async function scalar<T = unknown>(sql: string, params: unknown[] = []): Promise<T | null> {
	const db = await getDemoDb()
	const result = await db.query<{ value: T }>(sql, params)
	return result.rows[0]?.value ?? null
}

// ─── /api/dashboard/company-stats ────────────────────────────────────────────
// Consumed by partner-company dashboard (/dashboard/inicio).

const companyStatsHandler = http.get("*/api/dashboard/company-stats", async ({ request }) => {
	const url = new URL(request.url)
	const companyId = url.searchParams.get("companyId")
	if (!companyId) {
		return HttpResponse.json({ error: "companyId requerido" }, { status: 400 })
	}

	const db = await getDemoDb()
	const companyRows = await db.query<{
		name: string
		rut: string
	}>(`SELECT name, rut FROM "company" WHERE id = $1`, [companyId])
	const company = companyRows.rows[0]
	if (!company) {
		return HttpResponse.json({ error: "Empresa no encontrada" }, { status: 404 })
	}

	const collaborators =
		(await scalar<number>(
			`SELECT COUNT(*)::int AS value FROM "user" WHERE "companyId" = $1 AND "isActive" = true`,
			[companyId]
		)) ?? 0

	const vehicles =
		(await scalar<number>(
			`SELECT COUNT(*)::int AS value FROM "vehicle" WHERE "companyId" = $1`,
			[companyId]
		)) ?? 0

	const activeWorkOrders =
		(await scalar<number>(
			`SELECT COUNT(*)::int AS value FROM "work_order"
			 WHERE "companyId" = $1 AND "deletedAt" IS NULL
			 AND status IN ('PLANNED', 'PENDING', 'IN_PROGRESS', 'CLOSURE_REQUESTED')`,
			[companyId]
		)) ?? 0

	const activeWorkPermits =
		(await scalar<number>(
			`SELECT COUNT(*)::int AS value FROM "work_permit"
			 WHERE "companyId" = $1 AND status = 'ACTIVE'`,
			[companyId]
		)) ?? 0

	return HttpResponse.json({
		companyInfo: {
			name: company.name,
			rut: company.rut,
			address: null,
			phone: null,
			email: "",
			representativeName: null,
			representativeEmail: null,
			representativePhone: null,
		},
		basicStats: {
			collaborators,
			activeWorkPermits,
			vehicles,
			activeWorkOrders,
		},
		workPermitTypes: [],
		recentAlerts: [],
		activities: [],
		safetyStats: {
			incidentCount: 0,
			lastTrainingDate: null,
			safetyScore: 100,
			riskLevel: "low" as const,
			pendingCertifications: 0,
		},
	})
})

// ─── /api/dashboard/homepage-stats ───────────────────────────────────────────
// Consumed by the admin/internal dashboard (/admin/dashboard/inicio).
// Activity-derived charts are empty because the demo schema has no activity_log.

const WO_STATUS_LABELS: Record<string, string> = {
	PLANNED: "Planificado",
	PENDING: "Pendiente",
	IN_PROGRESS: "En Progreso",
	COMPLETED: "Completado",
}

const homepageStatsHandler = http.get("*/api/dashboard/homepage-stats", async () => {
	const db = await getDemoDb()

	const overviewRows = await db.query<{
		companies: number
		equipment: number
		users: number
		workOrders: number
		permits: number
		maintenancePlans: number
		startupFolders: number
		activeUsers: number
		adminUsers: number
		operationalEquipment: number
		criticalEquipment: number
		inProgressWorkOrders: number
		criticalWorkOrders: number
		activePermits: number
		activeMaintenancePlans: number
		completedStartupFolders: number
		inProgressStartupFolders: number
		activeCompanies: number
		companiesWithPendingDocs: number
	}>(
		`SELECT
			(SELECT COUNT(*)::int FROM "company") AS "companies",
			(SELECT COUNT(*)::int FROM "equipment") AS "equipment",
			(SELECT COUNT(*)::int FROM "user") AS "users",
			(SELECT COUNT(*)::int FROM "work_order" WHERE "deletedAt" IS NULL) AS "workOrders",
			(SELECT COUNT(*)::int FROM "work_permit") AS "permits",
			(SELECT COUNT(*)::int FROM "maintenance_plan") AS "maintenancePlans",
			(SELECT COUNT(*)::int FROM "startup_folder" WHERE "isDeleted" = false) AS "startupFolders",
			(SELECT COUNT(*)::int FROM "user" WHERE "isActive" = true) AS "activeUsers",
			(SELECT COUNT(*)::int FROM "user" WHERE "accessRole" = 'ADMIN') AS "adminUsers",
			(SELECT COUNT(*)::int FROM "equipment" WHERE "isOperational" = true) AS "operationalEquipment",
			(SELECT COUNT(*)::int FROM "equipment" WHERE "criticality" = 'CRITICAL') AS "criticalEquipment",
			(SELECT COUNT(*)::int FROM "work_order" WHERE "deletedAt" IS NULL AND status = 'IN_PROGRESS') AS "inProgressWorkOrders",
			(SELECT COUNT(*)::int FROM "work_order" WHERE "deletedAt" IS NULL AND priority = 'HIGH') AS "criticalWorkOrders",
			(SELECT COUNT(*)::int FROM "work_permit" WHERE status = 'ACTIVE') AS "activePermits",
			(SELECT COUNT(*)::int FROM "maintenance_plan" WHERE "isActive" = true) AS "activeMaintenancePlans",
			(SELECT COUNT(*)::int FROM "startup_folder" WHERE "isDeleted" = false AND status = 'COMPLETED') AS "completedStartupFolders",
			(SELECT COUNT(*)::int FROM "startup_folder" WHERE "isDeleted" = false AND status = 'IN_PROGRESS') AS "inProgressStartupFolders",
			(SELECT COUNT(*)::int FROM "company" WHERE "isActive" = true) AS "activeCompanies",
			(SELECT COUNT(DISTINCT "companyId")::int FROM "startup_folder" WHERE "isDeleted" = false AND status = 'PENDING') AS "companiesWithPendingDocs"`,
	)
	const o = overviewRows.rows[0]

	const pct = (part: number, total: number) => (total > 0 ? Math.round((part / total) * 100) : 0)

	const systemOverview = o ?? {
		companies: 0,
		equipment: 0,
		users: 0,
		workOrders: 0,
		permits: 0,
		maintenancePlans: 0,
		startupFolders: 0,
		activeUsers: 0,
		adminUsers: 0,
		operationalEquipment: 0,
		criticalEquipment: 0,
		inProgressWorkOrders: 0,
		criticalWorkOrders: 0,
		activePermits: 0,
		activeMaintenancePlans: 0,
		completedStartupFolders: 0,
		inProgressStartupFolders: 0,
		activeCompanies: 0,
		companiesWithPendingDocs: 0,
	}

	const shapeChart = [
		{ label: "Equipos Operativos", value: pct(systemOverview.operationalEquipment, systemOverview.equipment) },
		{ label: "Usuarios Activos", value: pct(systemOverview.activeUsers, systemOverview.users) },
		{ label: "Carpetas Completas", value: pct(systemOverview.completedStartupFolders, systemOverview.startupFolders) },
		{ label: "Órdenes en Progreso", value: systemOverview.inProgressWorkOrders },
		{ label: "Permisos Activos", value: systemOverview.activePermits },
	]

	// Work orders by status (pie chart).
	const woByStatus = await db.query<{ status: string; value: number }>(
		`SELECT status, COUNT(*)::int AS value
		 FROM "work_order"
		 WHERE "deletedAt" IS NULL
		 GROUP BY status`,
	)
	const workOrdersPieChart = woByStatus.rows.map((r) => ({
		name: WO_STATUS_LABELS[r.status] ?? r.status,
		value: r.value,
		status: r.status,
	}))

	// Work requests by month and urgency (last 5 months).
	const wrRows = await db.query<{ ym: string; urgente: number; noUrgente: number }>(
		`SELECT
			to_char(date_trunc('month', "requestDate"), 'YYYY-MM') AS ym,
			COUNT(*) FILTER (WHERE "isUrgent" = true)::int AS urgente,
			COUNT(*) FILTER (WHERE "isUrgent" = false)::int AS "noUrgente"
		 FROM "work_request"
		 WHERE "requestDate" >= NOW() - INTERVAL '5 months'
		 GROUP BY date_trunc('month', "requestDate")
		 ORDER BY ym ASC`,
	)
	const monthShort = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
	// Emit a continuous run of the last 5 months (filling zeros) so the area chart
	// renders a proper timeline instead of a couple of floating points.
	const wrMonthMap = new Map(wrRows.rows.map((r) => [r.ym, r]))
	const wrToday = new Date()
	const workRequestsAreaChart: { month: string; urgente: number; noUrgente: number }[] = []
	for (let i = 4; i >= 0; i--) {
		const d = new Date(wrToday.getFullYear(), wrToday.getMonth() - i, 1)
		const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
		const row = wrMonthMap.get(ym)
		workRequestsAreaChart.push({
			month: `${monthShort[d.getMonth()]} ${d.getFullYear()}`,
			urgente: row?.urgente ?? 0,
			noUrgente: row?.noUrgente ?? 0,
		})
	}

	// Percentage of active elements per module (horizontal bar chart).
	const moduleActivityChart = [
		{ name: "Equipos", percentage: pct(systemOverview.operationalEquipment, systemOverview.equipment) },
		{ name: "Usuarios", percentage: pct(systemOverview.activeUsers, systemOverview.users) },
		{ name: "Empresas", percentage: pct(systemOverview.activeCompanies, systemOverview.companies) },
		{ name: "Mantenimiento", percentage: pct(systemOverview.activeMaintenancePlans, systemOverview.maintenancePlans) },
		{ name: "Permisos de Trabajo", percentage: pct(systemOverview.activePermits, systemOverview.permits) },
		{ name: "Carpetas de Arranque", percentage: pct(systemOverview.completedStartupFolders, systemOverview.startupFolders) },
		{ name: "Órdenes de Trabajo", percentage: pct(systemOverview.inProgressWorkOrders, systemOverview.workOrders) },
	].sort((a, b) => b.percentage - a.percentage)

	// Module activity over the last 30 days. The demo has no activity_log table and
	// the seed dates are frozen in the past, so a real "last 30 days" window would
	// drift empty over time. Instead we synthesize a believable, deterministic
	// series (stable across reloads, always ending "today") whose per-module
	// magnitude is anchored to the real record volume of each module.
	const activityModules = [
		{ key: "workOrders", base: Math.max(2, Math.round(systemOverview.workOrders / 8)) },
		{ key: "workPermits", base: Math.max(1, Math.round(systemOverview.permits / 4)) },
		{ key: "maintenance", base: Math.max(1, Math.round(systemOverview.maintenancePlans / 2)) },
		{ key: "equipment", base: Math.max(2, Math.round(systemOverview.equipment / 8)) },
		{ key: "startupFolders", base: Math.max(1, systemOverview.startupFolders) },
		{ key: "safetyTalk", base: 2 },
		{ key: "lockoutPermits", base: 1 },
		{ key: "documentation", base: 2 },
		{ key: "workRequests", base: 2 },
		{ key: "company", base: 1 },
		{ key: "users", base: Math.max(1, Math.round(systemOverview.users / 8)) },
		{ key: "laborControlFolders", base: 1 },
	]

	const hashStr = (s: string): number => {
		let h = 2166136261
		for (let i = 0; i < s.length; i++) {
			h ^= s.charCodeAt(i)
			h = Math.imul(h, 16777619)
		}
		return h >>> 0
	}

	const moduleActivityAreaChart: Record<string, number | string>[] = []
	const todayMid = new Date()
	for (let i = 29; i >= 0; i--) {
		const d = new Date(todayMid.getFullYear(), todayMid.getMonth(), todayMid.getDate() - i)
		const dateKey = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`
		const dow = d.getDay()
		const weekendFactor = dow === 0 || dow === 6 ? 0.3 : 1
		const entry: Record<string, number | string> = { date: dateKey }
		for (const m of activityModules) {
			const jitter = 0.6 + (hashStr(dateKey + m.key) % 80) / 100 // 0.60 – 1.39
			entry[m.key] = Math.max(0, Math.round(m.base * weekendFactor * jitter))
		}
		moduleActivityAreaChart.push(entry)
	}

	return HttpResponse.json({
		systemOverview,
		shapeChart,
		moduleActivityChart,
		weeklyActivityChart: [],
		workOrdersPieChart,
		workRequestsAreaChart,
		moduleActivityAreaChart,
	})
})

export const dashboardHandlers = [companyStatsHandler, homepageStatsHandler]
