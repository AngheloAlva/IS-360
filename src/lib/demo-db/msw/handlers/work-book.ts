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

// ─── /api/work-book/:workOrderId ─────────────────────────────────────────────
// WorkBookMain reads this. Returns { workBook: WorkBookById }.

const byIdHandler = http.get("*/api/work-book/:workOrderId", async ({ params }) => {
	const id = params.workOrderId as string

	const rows = await query<Row>(
		`SELECT
			wo.*,
			c.id AS "c_id", c.name AS "c_name", c.rut AS "c_rut", c.image AS "c_image", c."isActive" AS "c_isActive",
			s.id AS "s_id", s.rut AS "s_rut", s.name AS "s_name", s.email AS "s_email", s.phone AS "s_phone",
			r.id AS "r_id", r.rut AS "r_rut", r.name AS "r_name", r.email AS "r_email", r.phone AS "r_phone"
		 FROM work_order wo
		 LEFT JOIN "company" c ON c.id = wo."companyId"
		 LEFT JOIN "user" s ON s.id = wo."supervisorId"
		 LEFT JOIN "user" r ON r.id = wo."responsibleId"
		 WHERE wo.id = $1 AND wo."deletedAt" IS NULL`,
		[id]
	)
	const wo = rows[0]
	if (!wo) {
		return HttpResponse.json({ error: "Orden de trabajo no encontrada" }, { status: 404 })
	}

	const equipments = await query<Row>(
		`SELECT
			e.id, e.tag, e.name, e.type,
			l.id AS "l_id", l.name AS "l_name", l.path AS "l_path"
		 FROM equipment e
		 JOIN "_EquipmentToWorkOrder" j ON j."A" = e.id
		 LEFT JOIN "Location" l ON l.id = e."locationId"
		 WHERE j."B" = $1`,
		[id]
	)

	const milestoneCount = (await scalar<number>(
		`SELECT COUNT(*)::int AS value FROM milestone WHERE "workOrderId" = $1`,
		[id]
	)) ?? 0

	const workBook = {
		// All work_order columns (id, otNumber, status, progress, dates, etc.)
		id: wo.id,
		otNumber: wo.otNumber,
		type: wo.type,
		status: wo.status,
		progress: wo.progress,
		solicitationDate: wo.solicitationDate,
		solicitationTime: wo.solicitationTime,
		workRequest: wo.workRequest,
		workDescription: wo.workDescription,
		priority: wo.priority,
		capex: wo.capex,
		programDate: wo.programDate,
		estimatedHours: wo.estimatedHours,
		estimatedDays: wo.estimatedDays,
		estimatedEndDate: wo.estimatedEndDate,
		rescheduledEndDate: wo.rescheduledEndDate,
		endDate: wo.endDate,
		isWorkBookInit: wo.isWorkBookInit,
		workBookName: wo.workBookName,
		workBookLocation: wo.workBookLocation,
		workBookStartDate: wo.workBookStartDate,
		companyId: wo.companyId,
		supervisorId: wo.supervisorId,
		responsibleId: wo.responsibleId,
		initReportId: wo.initReportId,
		endReportId: wo.endReportId,
		closureRequestedById: wo.closureRequestedById,
		closureRequestedAt: wo.closureRequestedAt,
		closureApprovedById: wo.closureApprovedById,
		closureApprovedAt: wo.closureApprovedAt,
		closureRejectedReason: wo.closureRejectedReason,
		createdAt: wo.createdAt,
		updatedAt: wo.updatedAt,
		// Relations
		equipments: equipments.map((e) => ({
			id: e.id,
			tag: e.tag,
			name: e.name,
			type: e.type ?? "",
			location: {
				id: e.l_id ?? "",
				name: e.l_name ?? "",
				path: e.l_path ?? "",
			},
			attachments: [],
		})),
		company: wo.c_id
			? {
					id: wo.c_id,
					rut: wo.c_rut,
					name: wo.c_name,
					image: wo.c_image ?? undefined,
					isActive: wo.c_isActive,
				}
			: undefined,
		supervisor: wo.s_id
			? {
					id: wo.s_id,
					rut: wo.s_rut ?? "",
					name: wo.s_name,
					email: wo.s_email ?? "",
					phone: wo.s_phone ?? "",
				}
			: { id: "", rut: "", name: "—", email: "", phone: "" },
		responsible: wo.r_id
			? {
					id: wo.r_id,
					rut: wo.r_rut ?? "",
					name: wo.r_name,
					email: wo.r_email ?? "",
					phone: wo.r_phone ?? "",
				}
			: { id: "", rut: "", name: "—", email: "", phone: "" },
		workPermits: [],
		_count: { milestones: milestoneCount },
	}

	return HttpResponse.json({ workBook })
})

// ─── Empty stubs so the detail page doesn't 500 on collateral queries ───────
// These return shape-compatible empty payloads; replace with real handlers as
// each sub-feature is built out.

const milestonesHandler = http.get("*/api/work-book/:workOrderId/milestones", async ({ params, request }) => {
	const workOrderId = params.workOrderId as string
	const url = new URL(request.url)
	const page = parseInt(url.searchParams.get("page") || "1", 10)
	const limit = parseInt(url.searchParams.get("limit") || "10", 10)
	const skip = (page - 1) * limit

	const total = (await scalar<number>(
		`SELECT COUNT(*)::int AS value FROM milestone WHERE "workOrderId" = $1`,
		[workOrderId]
	)) ?? 0

	const milestones = await query<Row>(
		`SELECT m.*
		 FROM milestone m
		 WHERE m."workOrderId" = $1
		 ORDER BY m."order" ASC
		 LIMIT $2 OFFSET $3`,
		[workOrderId, limit, skip]
	)

	const milestoneIds = milestones.map((m) => m.id as string).filter(Boolean)
	const entriesByMilestone = new Map<string, Row[]>()
	if (milestoneIds.length > 0) {
		const placeholders = milestoneIds.map((_, i) => `$${i + 1}`).join(", ")
		const entries = await query<Row>(
			`SELECT id, "executionDate", "activityName", comments,
				"activityStartTime", "activityEndTime", "milestoneId"
			 FROM work_book_entry
			 WHERE "milestoneId" IN (${placeholders})
			 ORDER BY "executionDate" ASC`,
			milestoneIds
		)
		for (const e of entries) {
			const mid = e.milestoneId as string
			if (!entriesByMilestone.has(mid)) entriesByMilestone.set(mid, [])
			entriesByMilestone.get(mid)!.push(e)
		}
	}

	return HttpResponse.json({
		milestones: milestones.map((m) => {
			const entries = entriesByMilestone.get(m.id as string) ?? []
			return {
				id: m.id,
				name: m.name,
				description: m.description ?? null,
				status: m.status,
				order: m.order,
				isCompleted: m.isCompleted,
				weight: m.weight,
				startDate: m.startDate,
				endDate: m.endDate,
				approvedAt: m.approvedAt ?? null,
				closureComment: m.closureComment ?? null,
				createdAt: m.createdAt,
				updatedAt: m.updatedAt,
				requestedById: m.requestedById ?? null,
				approvedById: m.approvedById ?? null,
				workOrderId: m.workOrderId,
				requestedBy: null,
				approvedBy: null,
				activities: entries.map((e) => ({
					id: e.id,
					executionDate: e.executionDate,
					activityName: e.activityName ?? "",
					comments: e.comments ?? null,
					activityEndTime: e.activityEndTime ?? null,
					activityStartTime: e.activityStartTime ?? null,
					_count: { assignedUsers: 0 },
				})),
				_count: { workBookEntries: entries.length },
			}
		}),
		total,
		pages: Math.max(1, Math.ceil(total / limit)),
	})
})

const entriesHandler = http.get("*/api/work-book/entries", async ({ request }) => {
	const url = new URL(request.url)
	const page = parseInt(url.searchParams.get("page") || "1", 10)
	const limit = parseInt(url.searchParams.get("limit") || "10", 10)
	const search = url.searchParams.get("search") || ""
	const workOrderId = url.searchParams.get("workOrderId")
	const milestone = url.searchParams.get("milestone")
	const skip = (page - 1) * limit

	const conditions: string[] = []
	const params: unknown[] = []
	if (workOrderId) {
		params.push(workOrderId)
		conditions.push(`e."workOrderId" = $${params.length}`)
	}
	if (milestone) {
		params.push(milestone)
		conditions.push(`e."milestoneId" = $${params.length}`)
	}
	if (search) {
		params.push(`%${search}%`)
		conditions.push(`(e."activityName" ILIKE $${params.length} OR e.comments ILIKE $${params.length})`)
	}
	const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : ""

	const total = (await scalar<number>(
		`SELECT COUNT(*)::int AS value FROM work_book_entry e ${where}`,
		params
	)) ?? 0

	const limitIdx = params.length + 1
	const offsetIdx = params.length + 2
	const rows = await query<Row>(
		`SELECT
			e.id, e."entryType", e."executionDate", e."activityName", e.comments,
			e."activityStartTime", e."activityEndTime", e."supervisionComments",
			e."safetyObservations", e."nonConformities", e."inspectionStatus",
			e."createdAt", e."milestoneId", e."workOrderId",
			u.name AS "creatorName",
			wo."workBookName" AS "woWorkBookName",
			m.name AS "milestoneName"
		 FROM work_book_entry e
		 LEFT JOIN "user" u ON u.id = e."createdById"
		 LEFT JOIN work_order wo ON wo.id = e."workOrderId"
		 LEFT JOIN milestone m ON m.id = e."milestoneId"
		 ${where}
		 ORDER BY e."executionDate" DESC
		 LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
		[...params, limit, skip]
	)

	// Milestone list for the filter dropdown — scoped by workOrder if provided
	let milestoneOptions: Row[] = []
	if (workOrderId) {
		milestoneOptions = await query<Row>(
			`SELECT id, name FROM milestone WHERE "workOrderId" = $1 ORDER BY "order" ASC`,
			[workOrderId]
		)
	}

	return HttpResponse.json({
		entries: rows.map((e) => ({
			id: e.id,
			activityName: e.activityName ?? "",
			comments: e.comments ?? "",
			createdAt: e.createdAt,
			activityStartTime: e.activityStartTime ?? "",
			activityEndTime: e.activityEndTime ?? "",
			supervisionComments: e.supervisionComments ?? "",
			safetyObservations: e.safetyObservations ?? "",
			nonConformities: e.nonConformities ?? "",
			inspectorName: "",
			recommendations: "",
			executionDate: e.executionDate,
			entryType: e.entryType,
			inspectionStatus: e.inspectionStatus ?? undefined,
			inspectionComments: [],
			others: "",
			createdBy: { name: (e.creatorName as string | null) ?? "—" },
			workOrder: e.workOrderId
				? { id: e.workOrderId, workBookName: (e.woWorkBookName as string | null) ?? "" }
				: undefined,
			assignedUsers: [],
			attachments: [],
			milestone: e.milestoneId
				? { id: e.milestoneId, name: (e.milestoneName as string | null) ?? "" }
				: undefined,
		})),
		milestones: milestoneOptions.map((m) => ({ id: m.id, name: m.name })),
		total,
		pages: Math.max(1, Math.ceil(total / limit)),
	})
})

const progressChartHandler = http.get("*/api/work-book/stats/progress", async () => {
	return HttpResponse.json({ data: [] })
})

const entriesChartHandler = http.get("*/api/work-book/stats/entries", async () => {
	return HttpResponse.json({ data: [] })
})

const statusChartHandler = http.get("*/api/work-book/stats/status", async () => {
	return HttpResponse.json({ data: [] })
})

// ─── /api/work-book/company/:companyId ──────────────────────────────────────
// Partner-company supervisor sees this on /dashboard/libro-de-obras.

const SORTABLE: Record<string, string> = {
	createdAt: 'wo."createdAt"',
	otNumber: 'wo."otNumber"',
	workBookName: 'wo."workBookName"',
	workBookStartDate: 'wo."workBookStartDate"',
	estimatedEndDate: 'wo."estimatedEndDate"',
	status: "wo.status",
	progress: "wo.progress",
	workBookLocation: 'wo."workBookLocation"',
	type: "wo.type",
	supervisorName: "s.name",
	responsibleName: "r.name",
}

const byCompanyHandler = http.get("*/api/work-book/company/:companyId", async ({ params, request }) => {
	const companyId = params.companyId as string
	const url = new URL(request.url)
	const page = parseInt(url.searchParams.get("page") || "1", 10)
	const limit = parseInt(url.searchParams.get("limit") || "10", 10)
	const search = url.searchParams.get("search") || ""
	const sortBy = url.searchParams.get("sortBy") || "createdAt"
	const sortOrder = (url.searchParams.get("sortOrder") || "desc").toLowerCase() === "asc" ? "ASC" : "DESC"
	const skip = (page - 1) * limit

	const orderColumn = SORTABLE[sortBy] ?? 'wo."createdAt"'

	const conditions: string[] = [`wo."companyId" = $1`, `wo."deletedAt" IS NULL`]
	const params2: unknown[] = [companyId]
	if (search) {
		params2.push(`%${search}%`)
		conditions.push(`(wo."otNumber" ILIKE $${params2.length} OR wo."workRequest" ILIKE $${params2.length} OR wo."workBookName" ILIKE $${params2.length})`)
	}
	const where = `WHERE ${conditions.join(" AND ")}`

	const totalResult = await query<{ value: number }>(
		`SELECT COUNT(*)::int AS value FROM work_order wo ${where}`,
		params2
	)
	const total = totalResult[0]?.value ?? 0

	const limitIdx = params2.length + 1
	const offsetIdx = params2.length + 2

	const rows = await query<Row>(
		`SELECT
			wo.*,
			c.id AS "c_id", c.name AS "c_name", c.image AS "c_image",
			s.id AS "s_id", s.name AS "s_name", s.email AS "s_email", s.role AS "s_role",
			r.id AS "r_id", r.name AS "r_name", r.email AS "r_email", r.role AS "r_role",
			(SELECT COUNT(*)::int FROM work_book_entry WHERE "workOrderId" = wo.id) AS "wbe_count"
		 FROM work_order wo
		 LEFT JOIN "company" c ON c.id = wo."companyId"
		 LEFT JOIN "user" s ON s.id = wo."supervisorId"
		 LEFT JOIN "user" r ON r.id = wo."responsibleId"
		 ${where}
		 ORDER BY ${orderColumn} ${sortOrder}
		 LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
		[...params2, limit, skip]
	)

	const woIds = rows.map((r) => r.id as string)
	const equipmentsByWo = new Map<string, { name: string }[]>()
	if (woIds.length > 0) {
		const placeholders = woIds.map((_, i) => `$${i + 1}`).join(", ")
		const equipRows = await query<{ B: string; name: string }>(
			`SELECT j."B", e.name
			 FROM "_EquipmentToWorkOrder" j
			 JOIN equipment e ON e.id = j."A"
			 WHERE j."B" IN (${placeholders})`,
			woIds
		)
		for (const eq of equipRows) {
			if (!equipmentsByWo.has(eq.B)) equipmentsByWo.set(eq.B, [])
			equipmentsByWo.get(eq.B)!.push({ name: eq.name })
		}
	}

	const workBooks = rows.map((wo) => ({
		id: wo.id,
		otNumber: wo.otNumber,
		workBookName: wo.workBookName ?? null,
		workBookLocation: wo.workBookLocation ?? null,
		workBookStartDate: wo.workBookStartDate ?? null,
		progress: wo.progress ?? 0,
		status: wo.status,
		solicitationDate: wo.solicitationDate,
		type: wo.type,
		priority: wo.priority,
		workRequest: wo.workRequest,
		programDate: wo.programDate,
		estimatedDays: wo.estimatedDays,
		estimatedHours: wo.estimatedHours,
		estimatedEndDate: wo.estimatedEndDate ?? null,
		rescheduledEndDate: wo.rescheduledEndDate ?? null,
		workDescription: wo.workDescription ?? "",
		equipments: equipmentsByWo.get(wo.id as string) ?? [],
		company: wo.c_id
			? { id: wo.c_id, name: wo.c_name, logo: (wo.c_image as string | null) ?? null }
			: undefined,
		supervisor: wo.s_id
			? { id: wo.s_id, name: wo.s_name, email: wo.s_email ?? "", role: wo.s_role ?? "" }
			: { id: "", name: "—", email: "", role: "" },
		responsible: wo.r_id
			? { id: wo.r_id, name: wo.r_name, email: wo.r_email ?? "", role: wo.r_role ?? "" }
			: { id: "", name: "—", email: "", role: "" },
		_count: { workBookEntries: (wo.wbe_count as number) ?? 0 },
	}))

	return HttpResponse.json({
		workBooks,
		total,
		pages: Math.max(1, Math.ceil(total / limit)),
	})
})

export const workBookHandlers = [
	byIdHandler,
	byCompanyHandler,
	milestonesHandler,
	entriesHandler,
	progressChartHandler,
	entriesChartHandler,
	statusChartHandler,
]
