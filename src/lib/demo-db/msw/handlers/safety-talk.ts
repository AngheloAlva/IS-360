import { http, HttpResponse } from "msw"

import { getDemoUser } from "@/lib/demo-auth"
import { getDemoDb } from "@/lib/demo-db/client"
import { submitSafetyTalkAttempt } from "@/project/safety-talk/actions/submit-attempt"

const ALL_CATEGORIES = ["VISITOR", "VISITOR_TRM", "IRL"] as const

const statsHandler = http.get("*/api/safety-talks/stats", async () => {
	const user = getDemoUser()
	if (!user) {
		return HttpResponse.json({ error: "No autorizado" }, { status: 401 })
	}

	const db = await getDemoDb()
	const res = await db.query<{
		total: string
		approved: string
		pending: string
		expired: string
	}>(
		`SELECT
			COUNT(*)::text AS "total",
			COUNT(*) FILTER (WHERE status = 'MANUALLY_APPROVED')::text AS "approved",
			COUNT(*) FILTER (WHERE status = 'PASSED')::text AS "pending",
			COUNT(*) FILTER (WHERE "expiresAt" < NOW())::text AS "expired"
		 FROM "user_safety_talk"`,
	)
	const row = res.rows[0]
	return HttpResponse.json({
		totalSafetyTalks: parseInt(row?.total ?? "0", 10),
		approvedSafetyTalks: parseInt(row?.approved ?? "0", 10),
		pendingApprovalSafetyTalks: parseInt(row?.pending ?? "0", 10),
		expiredSafetyTalks: parseInt(row?.expired ?? "0", 10),
	})
})

const byWorkerHandler = http.get(
	"*/api/safety-talks/by-worker/:workerId",
	async ({ params }) => {
		const user = getDemoUser()
		if (!user) {
			return HttpResponse.json({ error: "No autorizado" }, { status: 401 })
		}

		const workerId = params.workerId as string
		const db = await getDemoDb()
		const workerRes = await db.query<{ id: string; name: string; rut: string }>(
			`SELECT id, name, rut FROM "user" WHERE id = $1 LIMIT 1`,
			[workerId],
		)
		const worker = workerRes.rows[0]
		if (!worker) {
			return HttpResponse.json({ error: "Trabajador no encontrado" }, { status: 404 })
		}

		const talksRes = await db.query<{
			id: string
			category: string
			status: string
			score: number | null
			completedAt: string | null
			expiresAt: string | null
			currentAttempts: number
			lastAttemptAt: string | null
			manuallyApproved: boolean
			inPersonSessionDate: string | null
		}>(
			`SELECT id, category, status, score, "completedAt", "expiresAt",
				"currentAttempts", "lastAttemptAt", "manuallyApproved", "inPersonSessionDate"
			 FROM "user_safety_talk"
			 WHERE "userId" = $1
			 ORDER BY category ASC`,
			[workerId],
		)

		const byCategory = new Map<string, (typeof talksRes.rows)[number]>()
		for (const t of talksRes.rows) byCategory.set(t.category, t)

		const safetyTalks = ALL_CATEGORIES.map(
			(category) =>
				byCategory.get(category) ?? {
					id: `not-started-${category}`,
					category,
					status: "NOT_STARTED",
					score: null,
					completedAt: null,
					expiresAt: null,
					currentAttempts: 0,
					lastAttemptAt: null,
					manuallyApproved: false,
					inPersonSessionDate: null,
				},
		)

		return HttpResponse.json({ worker, safetyTalks })
	},
)

const chartsHandler = http.get("*/api/safety-talks/charts", async () => {
	const user = getDemoUser()
	if (!user) {
		return HttpResponse.json({ error: "No autorizado" }, { status: 401 })
	}
	const db = await getDemoDb()

	const categoryRes = await db.query<{ category: string; count: string }>(
		`SELECT category, COUNT(*)::text AS count
		 FROM "user_safety_talk"
		 GROUP BY category`,
	)
	const externalCategoryRes = await db.query<{ category: string; count: string }>(
		`SELECT vt.category, COUNT(*)::text AS count
		 FROM "visitor_talk_completion" c
		 JOIN "visitor_talk" vt ON vt.id = c."visitorTalkId"
		 WHERE c.status = 'COMPLETED' AND c.passed = true
		 GROUP BY vt.category`,
	)
	const categoryMap = new Map<string, number>()
	for (const r of categoryRes.rows) categoryMap.set(r.category, parseInt(r.count, 10))
	for (const r of externalCategoryRes.rows) {
		categoryMap.set(r.category, (categoryMap.get(r.category) ?? 0) + parseInt(r.count, 10))
	}

	const statusRes = await db.query<{ status: string; count: string }>(
		`SELECT status, COUNT(*)::text AS count
		 FROM "user_safety_talk"
		 GROUP BY status`,
	)
	const externalPassedRes = await db.query<{ count: string }>(
		`SELECT COUNT(*)::text AS count FROM "visitor_talk_completion"
		 WHERE status = 'COMPLETED' AND passed = true`,
	)
	const statusMap = new Map<string, number>()
	for (const r of statusRes.rows) statusMap.set(r.status, parseInt(r.count, 10))
	statusMap.set(
		"PASSED",
		(statusMap.get("PASSED") ?? 0) + parseInt(externalPassedRes.rows[0]?.count ?? "0", 10),
	)

	return HttpResponse.json({
		byCategory: Array.from(categoryMap.entries()).map(([category, count]) => ({
			category,
			count,
		})),
		byStatus: Array.from(statusMap.entries()).map(([status, count]) => ({ status, count })),
		byMonth: [],
	})
})

const tableHandler = http.get("*/api/safety-talks/table", async ({ request }) => {
	const user = getDemoUser()
	if (!user) {
		return HttpResponse.json({ error: "No autorizado" }, { status: 401 })
	}

	const url = new URL(request.url)
	const page = parseInt(url.searchParams.get("page") || "1", 10)
	const limit = parseInt(url.searchParams.get("limit") || "10", 10)
	const search = url.searchParams.get("search") || ""
	const skip = (page - 1) * limit

	const db = await getDemoDb()

	const internalConditions: string[] = []
	const internalParams: unknown[] = []
	if (search) {
		internalParams.push(`%${search}%`)
		internalConditions.push(
			`(u.name ILIKE $${internalParams.length} OR u.email ILIKE $${internalParams.length} OR u.rut ILIKE $${internalParams.length})`,
		)
	}
	const internalWhere = internalConditions.length ? `WHERE ${internalConditions.join(" AND ")}` : ""

	const internalRes = await db.query<{
		id: string
		category: string
		status: string
		score: number | null
		completedAt: string | null
		expiresAt: string | null
		currentAttempts: number
		lastAttemptAt: string | null
		user_id: string | null
		user_name: string | null
		user_email: string | null
		user_rut: string | null
		company_id: string | null
		company_name: string | null
	}>(
		`SELECT
			t.id, t.category, t.status, t.score, t."completedAt", t."expiresAt",
			t."currentAttempts", t."lastAttemptAt",
			u.id AS "user_id", u.name AS "user_name", u.email AS "user_email", u.rut AS "user_rut",
			c.id AS "company_id", c.name AS "company_name"
		 FROM "user_safety_talk" t
		 LEFT JOIN "user" u ON u.id = t."userId"
		 LEFT JOIN "company" c ON c.id = u."companyId"
		 ${internalWhere}
		 ORDER BY t."completedAt" DESC NULLS LAST`,
		internalParams,
	)

	const externalConditions: string[] = [`c.status = 'COMPLETED'`, `c.passed = true`]
	const externalParams: unknown[] = []
	if (search) {
		externalParams.push(`%${search}%`)
		externalConditions.push(
			`(v.name ILIKE $${externalParams.length} OR v.email ILIKE $${externalParams.length} OR v.rut ILIKE $${externalParams.length})`,
		)
	}
	const externalWhere = `WHERE ${externalConditions.join(" AND ")}`
	const externalRes = await db.query<{
		id: string
		category: string
		score: number | null
		completedAt: string | null
		attemptNumber: number
		visitor_id: string | null
		visitor_name: string | null
		visitor_email: string | null
		visitor_rut: string | null
		ec_id: string | null
		ec_name: string | null
	}>(
		`SELECT
			c.id, vt.category, c.score, c."completedAt", c."attemptNumber",
			v.id AS "visitor_id", v.name AS "visitor_name", v.email AS "visitor_email", v.rut AS "visitor_rut",
			ec.id AS "ec_id", ec.name AS "ec_name"
		 FROM "visitor_talk_completion" c
		 JOIN "visitor_talk" vt ON vt.id = c."visitorTalkId"
		 LEFT JOIN "external_visitor" v ON v.id = c."visitorId"
		 LEFT JOIN "external_company" ec ON ec.id = v."companyId"
		 ${externalWhere}
		 ORDER BY c."completedAt" DESC NULLS LAST`,
		externalParams,
	)

	const internal = internalRes.rows.map((row) => ({
		id: row.id,
		category: row.category,
		status: row.status,
		score: row.score,
		completedAt: row.completedAt,
		expiresAt: row.expiresAt,
		currentAttempts: row.currentAttempts,
		lastAttemptAt: row.lastAttemptAt,
		isExternal: false as const,
		user: row.user_id
			? {
					id: row.user_id,
					name: row.user_name,
					email: row.user_email,
					rut: row.user_rut,
					company: row.company_id ? { id: row.company_id, name: row.company_name } : null,
				}
			: null,
	}))

	const external = externalRes.rows.map((row) => ({
		id: row.id,
		category: row.category,
		status: "PASSED",
		score: row.score,
		completedAt: row.completedAt,
		expiresAt: row.completedAt
			? new Date(new Date(row.completedAt).setFullYear(new Date(row.completedAt).getFullYear() + 1)).toISOString()
			: null,
		currentAttempts: row.attemptNumber,
		lastAttemptAt: row.completedAt,
		isExternal: true as const,
		externalVisitor: row.visitor_id
			? {
					id: row.visitor_id,
					name: row.visitor_name,
					email: row.visitor_email,
					rut: row.visitor_rut,
					company: row.ec_id ? { id: row.ec_id, name: row.ec_name } : null,
				}
			: null,
	}))

	const all = [...internal, ...external].sort((a, b) => {
		const da = a.completedAt ? new Date(a.completedAt).getTime() : 0
		const dbb = b.completedAt ? new Date(b.completedAt).getTime() : 0
		return dbb - da
	})

	const total = all.length
	const data = all.slice(skip, skip + limit)

	return HttpResponse.json({
		data,
		total,
		pages: Math.max(1, Math.ceil(total / limit)),
	})
})

const attemptHandler = http.post("*/api/safety-talks/attempt", async ({ request }) => {
	const user = getDemoUser()
	if (!user) {
		return HttpResponse.json({ error: "No autorizado" }, { status: 401 })
	}
	try {
		const data = await request.json()
		await submitSafetyTalkAttempt(data)
		return HttpResponse.json({ success: true })
	} catch (error) {
		return HttpResponse.json(
			{ error: error instanceof Error ? error.message : "Error al enviar el intento" },
			{ status: 400 },
		)
	}
})

const contractorHandler = http.get("*/api/safety-talks/contractor", () => {
	return HttpResponse.json({ safetyTalks: [], total: 0, pages: 0 })
})

const listHandler = http.get("*/api/safety-talks", async ({ request }) => {
	// Fallback listing — most consumers use /table or /by-worker. Keep an
	// empty-but-valid shape so the catch-all doesn't reply with []/.json/string.
	void request
	return HttpResponse.json({ safetyTalks: [], total: 0, pages: 0 })
})

// ORDER MATTERS: specific paths first, then list
export const safetyTalkHandlers = [
	statsHandler,
	chartsHandler,
	tableHandler,
	attemptHandler,
	byWorkerHandler,
	contractorHandler,
	listHandler,
]
