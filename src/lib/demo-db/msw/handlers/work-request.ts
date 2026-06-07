import { http, HttpResponse } from "msw"

import { getDemoDb } from "@/lib/demo-db/client"

const COMMON_COLUMNS = `
	wr.*,
	u.id AS "user_id", u.name AS "user_name", u.email AS "user_email", u.image AS "user_image",
	c.id AS "company_id", c.name AS "company_name",
	ab.id AS "approvalBy_id", ab.name AS "approvalBy_name",
	op.id AS "operator_id", op.name AS "operator_name"
`

const COMMON_JOINS = `
	LEFT JOIN "user" u ON u.id = wr."userId"
	LEFT JOIN "company" c ON c.id = u."companyId"
	LEFT JOIN "user" ab ON ab.id = wr."approvalById"
	LEFT JOIN "user" op ON op.id = wr."operatorId"
`

function shapeRow(row: Record<string, unknown>, includeRelated: {
	equipments: Array<{ id: string; name: string; tag: string }>
	attachments: Array<Record<string, unknown>>
	commentsCount: number
}) {
	return {
		...row,
		user: row.user_id
			? {
					id: row.user_id,
					name: row.user_name,
					email: row.user_email,
					image: row.user_image,
					company: row.company_id ? { id: row.company_id, name: row.company_name } : null,
				}
			: null,
		approvalBy: row.approvalBy_id
			? { id: row.approvalBy_id, name: row.approvalBy_name }
			: null,
		operator: row.operator_id
			? { id: row.operator_id, name: row.operator_name }
			: null,
		equipments: includeRelated.equipments,
		attachments: includeRelated.attachments,
		_count: { comments: includeRelated.commentsCount },
	}
}

async function loadRelated(id: string) {
	const db = await getDemoDb()
	const eq = await db.query<{ id: string; name: string; tag: string }>(
		`SELECT e.id, e.name, e.tag
		 FROM "_EquipmentToWorkRequest" ewr
		 JOIN "equipment" e ON e.id = ewr."A"
		 WHERE ewr."B" = $1`,
		[id],
	)
	const attachments = await db.query<Record<string, unknown>>(
		`SELECT * FROM "attachment" WHERE "workRequestId" = $1`,
		[id],
	)
	const comments = await db.query<{ count: number }>(
		`SELECT COUNT(*)::int AS count FROM "work_request_comment" WHERE "workRequestId" = $1`,
		[id],
	)
	return {
		equipments: eq.rows,
		attachments: attachments.rows,
		commentsCount: comments.rows[0]?.count ?? 0,
	}
}

const listHandler = http.get("*/api/work-request", async ({ request }) => {
	const url = new URL(request.url)
	const page = parseInt(url.searchParams.get("page") ?? "1", 10)
	const limit = parseInt(url.searchParams.get("limit") ?? "10", 10)
	const search = url.searchParams.get("search") ?? ""
	const status = url.searchParams.get("status") ?? "all"
	const isUrgent = url.searchParams.get("isUrgent") ?? "all"
	const sortBy = url.searchParams.get("sortBy") ?? "createdAt"
	const sortOrder = url.searchParams.get("sortOrder") === "asc" ? "ASC" : "DESC"

	const allowedSort: Record<string, string> = {
		requestNumber: '"requestNumber"',
		requestDate: '"requestDate"',
		status: "status",
		isUrgent: '"isUrgent"',
		workType: '"workType"',
		createdAt: '"createdAt"',
	}
	const orderColumn = allowedSort[sortBy] ?? '"createdAt"'

	const conditions: string[] = []
	const params: unknown[] = []
	if (search) {
		params.push(`%${search}%`)
		conditions.push(
			`(wr."requestNumber" ILIKE $${params.length} OR wr.description ILIKE $${params.length})`,
		)
	}
	if (status !== "all") {
		params.push(status)
		conditions.push(`wr.status = $${params.length}`)
	}
	if (isUrgent === "true") conditions.push(`wr."isUrgent" = true`)
	if (isUrgent === "false") conditions.push(`wr."isUrgent" = false`)

	const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : ""

	const db = await getDemoDb()
	const totalResult = await db.query<{ value: number }>(
		`SELECT COUNT(*)::int AS value FROM "work_request" wr ${where}`,
		params,
	)
	const total = totalResult.rows[0]?.value ?? 0

	const skip = (page - 1) * limit
	const result = await db.query<Record<string, unknown>>(
		`SELECT ${COMMON_COLUMNS}
		 FROM "work_request" wr ${COMMON_JOINS}
		 ${where}
		 ORDER BY wr.${orderColumn} ${sortOrder}
		 LIMIT ${limit} OFFSET ${skip}`,
		params,
	)

	const workRequests = await Promise.all(
		result.rows.map(async (row) => {
			const related = await loadRelated(row.id as string)
			return shapeRow(row, related)
		}),
	)

	return HttpResponse.json({
		workRequests,
		total,
		pages: Math.ceil(total / limit),
	})
})

const statsHandler = http.get("*/api/work-request/stats", async () => {
	const db = await getDemoDb()
	const totals = await db.query<{
		total: number
		pending: number
		attended: number
		cancelled: number
		urgent: number
		urgent_attended: number
		urgent_pending: number
		nonurgent_attended: number
		nonurgent_pending: number
	}>(
		`SELECT
			COUNT(*)::int AS total,
			COUNT(*) FILTER (WHERE status = 'REPORTED')::int AS pending,
			COUNT(*) FILTER (WHERE status = 'ATTENDED')::int AS attended,
			COUNT(*) FILTER (WHERE status = 'CANCELLED')::int AS cancelled,
			COUNT(*) FILTER (WHERE "isUrgent" = true)::int AS urgent,
			COUNT(*) FILTER (WHERE "isUrgent" = true AND status = 'ATTENDED')::int AS urgent_attended,
			COUNT(*) FILTER (WHERE "isUrgent" = true AND status = 'REPORTED')::int AS urgent_pending,
			COUNT(*) FILTER (WHERE "isUrgent" = false AND status = 'ATTENDED')::int AS nonurgent_attended,
			COUNT(*) FILTER (WHERE "isUrgent" = false AND status = 'REPORTED')::int AS nonurgent_pending
		 FROM "work_request"`,
	)
	const t = totals.rows[0]!

	// Daily created/attended counts for the last 30 days.
	const daily = await db.query<{ day: string; created: number; attended: number }>(
		`SELECT to_char(DATE("requestDate"), 'YYYY-MM-DD') AS day,
			COUNT(*)::int AS created,
			COUNT(*) FILTER (WHERE status = 'ATTENDED')::int AS attended
		 FROM "work_request"
		 WHERE "requestDate" >= NOW() - INTERVAL '30 days'
		 GROUP BY DATE("requestDate")`,
	)
	const dailyMap = new Map(daily.rows.map((r) => [r.day, r]))
	const monthlyTrend: { month: string; created: number; attended: number }[] = []
	const today = new Date()
	for (let i = 29; i >= 0; i--) {
		const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i)
		const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
		const row = dailyMap.get(key)
		monthlyTrend.push({ month: key, created: row?.created ?? 0, attended: row?.attended ?? 0 })
	}

	return HttpResponse.json({
		totalWorkRequests: t.total,
		totalPending: t.pending,
		totalAttended: t.attended,
		totalUrgent: t.urgent,
		totalCancelled: t.cancelled,
		urgencyStats: {
			urgent: {
				attended: t.urgent_attended,
				pending: t.urgent_pending,
			},
			nonUrgent: {
				attended: t.nonurgent_attended,
				pending: t.nonurgent_pending,
			},
		},
		monthlyTrend,
		operatorStats: [],
	})
})

const detailHandler = http.get("*/api/work-request/:id", async ({ params }) => {
	const id = params.id as string
	const db = await getDemoDb()
	const result = await db.query<Record<string, unknown>>(
		`SELECT ${COMMON_COLUMNS}
		 FROM "work_request" wr ${COMMON_JOINS}
		 WHERE wr.id = $1`,
		[id],
	)
	const row = result.rows[0]
	if (!row) {
		return HttpResponse.json(null)
	}

	const related = await loadRelated(id)
	const commentsResult = await db.query<Record<string, unknown>>(
		`SELECT c.*,
			u.name AS "user_name", u.email AS "user_email", u.image AS "user_image"
		 FROM "work_request_comment" c
		 LEFT JOIN "user" u ON u.id = c."userId"
		 WHERE c."workRequestId" = $1
		 ORDER BY c."createdAt" ASC`,
		[id],
	)

	return HttpResponse.json({
		...shapeRow(row, related),
		comments: commentsResult.rows.map((c) => ({
			...c,
			user: { name: c.user_name, email: c.user_email, image: c.user_image },
		})),
	})
})

export const workRequestHandlers = [statsHandler, detailHandler, listHandler]
