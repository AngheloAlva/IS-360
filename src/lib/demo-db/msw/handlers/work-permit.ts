import { http, HttpResponse } from "msw"

import { getDemoDb } from "@/lib/demo-db/client"

const COMMON_PERMIT_COLUMNS = `
	wp.*,
	u.id AS "user_id", u.name AS "user_name", u.rut AS "user_rut",
	c.id AS "company_id", c.name AS "company_name", c.rut AS "company_rut",
	ab.id AS "ab_id", ab.name AS "ab_name", ab.rut AS "ab_rut",
	cb.id AS "cb_id", cb.name AS "cb_name", cb.rut AS "cb_rut",
	wo."otNumber" AS "ot_otNumber", wo."workBookName" AS "ot_workBookName",
	wo."workRequest" AS "ot_workRequest", wo."workDescription" AS "ot_workDescription"
`

const PERMIT_JOINS = `
	LEFT JOIN "user" u ON u.id = wp."userId"
	LEFT JOIN "company" c ON c.id = wp."companyId"
	LEFT JOIN "user" ab ON ab.id = wp."approvalById"
	LEFT JOIN "user" cb ON cb.id = wp."closingById"
	LEFT JOIN "work_order" wo ON wo.id = wp."otNumberId"
`

function buildPermitFromRow(row: Record<string, unknown>) {
	return {
		...row,
		user: row.user_id
			? { id: row.user_id, name: row.user_name, rut: row.user_rut }
			: null,
		company: row.company_id
			? { id: row.company_id, name: row.company_name, rut: row.company_rut }
			: null,
		approvalBy: row.ab_id
			? { id: row.ab_id, name: row.ab_name, rut: row.ab_rut }
			: null,
		closingBy: row.cb_id
			? { id: row.cb_id, name: row.cb_name, rut: row.cb_rut }
			: null,
		otNumber: row.ot_otNumber
			? {
					otNumber: row.ot_otNumber,
					workBookName: row.ot_workBookName,
					workRequest: row.ot_workRequest,
					workDescription: row.ot_workDescription,
				}
			: null,
	}
}

const listHandler = http.get("*/api/work-permit", async ({ request }) => {
	const url = new URL(request.url)
	const page = parseInt(url.searchParams.get("page") || "1", 10)
	const limit = parseInt(url.searchParams.get("limit") || "10", 10)
	const search = url.searchParams.get("search") || ""
	const statusFilter = url.searchParams.get("statusFilter")
	const companyId = url.searchParams.get("companyId")
	const typeFilter = url.searchParams.get("typeFilter")
	const approvedBy = url.searchParams.get("approvedBy")
	const dateFrom = url.searchParams.get("dateFrom")
	const dateTo = url.searchParams.get("dateTo")
	const skip = (page - 1) * limit

	const db = await getDemoDb()
	const conditions: string[] = []
	const params: unknown[] = []

	if (search) {
		params.push(`%${search}%`)
		conditions.push(`(wp."exactPlace" ILIKE $${params.length} OR wo."otNumber" ILIKE $${params.length} OR wo."workRequest" ILIKE $${params.length})`)
	}
	if (statusFilter) {
		params.push(statusFilter)
		conditions.push(`wp.status = $${params.length}`)
	}
	if (companyId) {
		params.push(companyId)
		conditions.push(`wp."companyId" = $${params.length}`)
	}
	if (typeFilter) {
		params.push(typeFilter)
		conditions.push(`wp."workWillBe" = $${params.length}`)
	}
	if (approvedBy) {
		params.push(approvedBy)
		conditions.push(`wp."approvalById" = $${params.length}`)
	}
	if (dateFrom) {
		params.push(new Date(decodeURIComponent(dateFrom)).toISOString())
		conditions.push(`wp."createdAt" >= $${params.length}`)
	}
	if (dateTo) {
		const d = new Date(decodeURIComponent(dateTo))
		d.setHours(23, 59, 59, 999)
		params.push(d.toISOString())
		conditions.push(`wp."createdAt" <= $${params.length}`)
	}

	const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : ""

	const totalResult = await db.query<{ value: number }>(
		`SELECT COUNT(*)::int AS value FROM "work_permit" wp
		 LEFT JOIN "work_order" wo ON wo.id = wp."otNumberId"
		 ${where}`,
		params,
	)
	const total = totalResult.rows[0]?.value ?? 0

	const result = await db.query<Record<string, unknown>>(
		`SELECT ${COMMON_PERMIT_COLUMNS},
			(SELECT COUNT(*)::int FROM "_WorkPermitParticipants" p WHERE p."B" = wp.id) AS "participantsCount",
			(SELECT COUNT(*)::int FROM "work_permit_attachment" a WHERE a."workPermitId" = wp.id) AS "attachmentsCount"
		 FROM "work_permit" wp ${PERMIT_JOINS}
		 ${where}
		 ORDER BY wp."createdAt" DESC
		 LIMIT ${limit} OFFSET ${skip}`,
		params,
	)

	const workPermits = result.rows.map((row) => ({
		...buildPermitFromRow(row),
		_count: {
			participants: row.participantsCount ?? 0,
			attachments: row.attachmentsCount ?? 0,
		},
		participants: [],
		attachments: [],
		lockoutPermits: [],
	}))

	return HttpResponse.json({
		workPermits,
		total,
		pages: Math.ceil(total / limit),
	})
})

const statsHandler = http.get("*/api/work-permit/stats", async () => {
	const db = await getDemoDb()

	const total = await db.query<{ value: number }>(
		`SELECT COUNT(*)::int AS value FROM "work_permit"`,
	)
	const byStatus = await db.query<{ status: string; count: number }>(
		`SELECT status, COUNT(*)::int AS count FROM "work_permit" GROUP BY status`,
	)
	const byType = await db.query<{ workWillBe: string | null; count: number }>(
		`SELECT "workWillBe", COUNT(*)::int AS count FROM "work_permit"
		 GROUP BY "workWillBe" ORDER BY count DESC LIMIT 5`,
	)
	const activeByCompany = await db.query<{
		companyId: string
		companyName: string
		count: number
	}>(
		`SELECT wp."companyId", c.name AS "companyName", COUNT(*)::int AS count
		 FROM "work_permit" wp
		 LEFT JOIN "company" c ON c.id = wp."companyId"
		 WHERE wp.status = 'ACTIVE'
		 GROUP BY wp."companyId", c.name
		 ORDER BY count DESC LIMIT 5`,
	)

	const colors: Record<string, string> = {
		ACTIVE: "var(--color-pink-500)",
		COMPLETED: "var(--color-purple-500)",
		REVIEW_PENDING: "var(--color-amber-500)",
	}

	return HttpResponse.json({
		totalWorkPermits: total.rows[0]?.value ?? 0,
		workPermitsByStatus: byStatus.rows.map((r) => ({
			status: r.status,
			count: r.count,
			fill: colors[r.status] ?? "var(--color-red-500)",
		})),
		workPermitsByType: byType.rows.map((r) => ({
			type: r.workWillBe || "Otro",
			count: r.count,
		})),
		activeWorkPermitsByCompany: activeByCompany.rows,
		activityData: [],
	})
})

const detailHandler = http.get("*/api/work-permit/:id", async ({ params }) => {
	const id = params.id as string
	const db = await getDemoDb()

	const result = await db.query<Record<string, unknown>>(
		`SELECT ${COMMON_PERMIT_COLUMNS},
			(SELECT COUNT(*)::int FROM "_WorkPermitParticipants" p WHERE p."B" = wp.id) AS "participantsCount",
			(SELECT COUNT(*)::int FROM "work_permit_attachment" a WHERE a."workPermitId" = wp.id) AS "attachmentsCount"
		 FROM "work_permit" wp ${PERMIT_JOINS}
		 WHERE wp.id = $1`,
		[id],
	)
	const row = result.rows[0]
	if (!row) {
		return HttpResponse.json(null)
	}

	const participants = await db.query<{ id: string; name: string }>(
		`SELECT u.id, u.name FROM "_WorkPermitParticipants" p
		 JOIN "user" u ON u.id = p."A"
		 WHERE p."B" = $1`,
		[id],
	)
	const attachments = await db.query<Record<string, unknown>>(
		`SELECT a.id, a.name, a.url, a.type, a.size, a."uploadedAt",
			u.id AS uploadedBy_id, u.name AS uploadedBy_name
		 FROM "work_permit_attachment" a
		 LEFT JOIN "user" u ON u.id = a."uploadedById"
		 WHERE a."workPermitId" = $1
		 ORDER BY a."uploadedAt" DESC`,
		[id],
	)
	const activities = await db.query<Record<string, unknown>>(
		`SELECT * FROM "WorkPermitActivity" WHERE "workPermitId" = $1 ORDER BY "order" ASC`,
		[id],
	)

	return HttpResponse.json({
		...buildPermitFromRow(row),
		_count: {
			participants: row.participantsCount ?? 0,
			attachments: row.attachmentsCount ?? 0,
		},
		participants: participants.rows,
		attachments: attachments.rows.map((a) => ({
			id: a.id,
			name: a.name,
			url: a.url,
			type: a.type,
			size: a.size,
			uploadedAt: a.uploadedAt,
			uploadedBy: a.uploadedBy_id
				? { id: a.uploadedBy_id, name: a.uploadedBy_name }
				: null,
		})),
		activities: activities.rows,
	})
})

const statusHandler = http.get("*/api/work-permit/:id/status", async ({ params }) => {
	const id = params.id as string
	const db = await getDemoDb()
	const result = await db.query<{ status: string; workCompleted: boolean | null }>(
		`SELECT status, "workCompleted" FROM "work_permit" WHERE id = $1`,
		[id],
	)
	return HttpResponse.json(result.rows[0] ?? null)
})

const lockoutsHandler = http.get(
	"*/api/work-permit/:id/lockout-permits",
	async () => HttpResponse.json([]),
)

const pdfHandler = http.get(
	"*/api/work-permit/pdf/:id",
	async () =>
		HttpResponse.json(
			{ error: "PDF generation not available in demo" },
			{ status: 501 },
		),
)

const pdfBlankHandler = http.get(
	"*/api/work-permit/pdf/blank",
	async () =>
		HttpResponse.json(
			{ error: "PDF generation not available in demo" },
			{ status: 501 },
		),
)

export const workPermitHandlers = [
	statsHandler,
	pdfBlankHandler,
	pdfHandler,
	lockoutsHandler,
	statusHandler,
	detailHandler,
	listHandler,
]
