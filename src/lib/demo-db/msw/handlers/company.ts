import { http, HttpResponse } from "msw"

import { getDemoDb } from "@/lib/demo-db/client"

const SAFE_LIST_SORT = new Set(["name", "rut", "createdAt"])
const SAFE_VEHICLE_SORT = new Set([
	"plate",
	"model",
	"year",
	"brand",
	"type",
	"isMain",
	"createdAt",
])

const detailHandler = http.get("*/api/companies/:companyId", async ({ params }) => {
	const db = await getDemoDb()
	const result = await db.query<{
		id: string
		rut: string
		name: string
		image: string | null
	}>(
		`SELECT id, rut, name, image FROM "company" WHERE id = $1`,
		[params.companyId as string],
	)
	return HttpResponse.json({ company: result.rows[0] ?? null })
})

const vehiclesHandler = http.get("*/api/companies/vehicles", async ({ request }) => {
	const url = new URL(request.url)
	const page = parseInt(url.searchParams.get("page") || "1", 10)
	const limit = parseInt(url.searchParams.get("limit") || "10", 10)
	const search = url.searchParams.get("search") || ""
	const companyId = url.searchParams.get("companyId")
	const typeFilter = url.searchParams.get("typeFilter")
	const sortByRaw = url.searchParams.get("sortBy") || "createdAt"
	const sortBy = SAFE_VEHICLE_SORT.has(sortByRaw) ? sortByRaw : "createdAt"
	const sortOrder = url.searchParams.get("sortOrder") === "asc" ? "ASC" : "DESC"
	const skip = (page - 1) * limit

	if (!companyId) {
		return HttpResponse.json({ total: 0, pages: 0, vehicles: [] })
	}

	const db = await getDemoDb()
	const conditions: string[] = [`"isActive" = true`, `"companyId" = $1`]
	const params: unknown[] = [companyId]
	if (typeFilter) {
		params.push(typeFilter)
		conditions.push(`type = $${params.length}`)
	}
	if (search) {
		params.push(`%${search}%`)
		conditions.push(
			`(model ILIKE $${params.length} OR plate ILIKE $${params.length} OR brand ILIKE $${params.length})`,
		)
	}

	const where = `WHERE ${conditions.join(" AND ")}`
	const totalRes = await db.query<{ count: string }>(
		`SELECT COUNT(*)::text AS count FROM "vehicle" ${where}`,
		params,
	)
	const total = parseInt(totalRes.rows[0]?.count ?? "0", 10)

	const vehiclesRes = await db.query(
		`SELECT id, year, type, model, plate, brand, color, "isMain", "createdAt", "companyId"
		 FROM "vehicle" ${where}
		 ORDER BY "${sortBy}" ${sortOrder}
		 LIMIT ${limit} OFFSET ${skip}`,
		params,
	)

	return HttpResponse.json({
		total,
		vehicles: vehiclesRes.rows,
		pages: Math.ceil(total / limit),
	})
})

const statsHandler = http.get("*/api/companies/stats", async () => {
	const db = await getDemoDb()

	// Per-company aggregate counts (excludes the internal owner company by RUT).
	const companies = await db.query<{
		id: string
		name: string
		rut: string
		image: string | null
		createdAt: string | Date | null
		activeUsers: number
		vehicles: number
		activeWorkOrders: number
		completedProjects: number
	}>(
		`SELECT c.id, c.name, c.rut, c.image, c."createdAt",
			(SELECT COUNT(*)::int FROM "user" u WHERE u."companyId" = c.id) AS "activeUsers",
			(SELECT COUNT(*)::int FROM "vehicle" v WHERE v."companyId" = c.id) AS "vehicles",
			(SELECT COUNT(*)::int FROM "work_order" wo WHERE wo."companyId" = c.id AND wo."deletedAt" IS NULL) AS "activeWorkOrders",
			(SELECT COUNT(*)::int FROM "work_order" wo WHERE wo."companyId" = c.id AND wo."deletedAt" IS NULL AND wo.status = 'COMPLETED') AS "completedProjects"
		 FROM "company" c
		 WHERE c.rut <> '96.655.490-8'
		 ORDER BY c.name ASC`,
	)

	// Document review status across all startup sub-folders, grouped by company.
	const docStatuses = await db.query<{ company_id: string; status: string; count: number }>(
		`SELECT company_id, status, COUNT(*)::int AS count FROM (
			SELECT sf."companyId" AS company_id, f.status::text AS status FROM "worker_folders" f JOIN "startup_folder" sf ON sf.id = f."startupFolderId" WHERE sf."isDeleted" = false
			UNION ALL
			SELECT sf."companyId", f.status::text FROM "vehicle_folders" f JOIN "startup_folder" sf ON sf.id = f."startupFolderId" WHERE sf."isDeleted" = false
			UNION ALL
			SELECT sf."companyId", f.status::text FROM "environmental_folder" f JOIN "startup_folder" sf ON sf.id = f."startupFolderId" WHERE sf."isDeleted" = false
			UNION ALL
			SELECT sf."companyId", f.status::text FROM "safety_and_health_folder" f JOIN "startup_folder" sf ON sf.id = f."startupFolderId" WHERE sf."isDeleted" = false
		) all_folders
		GROUP BY company_id, status`,
	)

	const docMap = new Map<string, { pending: number; reviewing: number; approved: number }>()
	for (const row of docStatuses.rows) {
		const entry = docMap.get(row.company_id) ?? { pending: 0, reviewing: 0, approved: 0 }
		if (row.status === "DRAFT" || row.status === "REJECTED") entry.pending += row.count
		else if (row.status === "SUBMITTED") entry.reviewing += row.count
		else if (row.status === "APPROVED") entry.approved += row.count
		docMap.set(row.company_id, entry)
	}

	const companiesData = companies.rows.map((c) => {
		const docs = docMap.get(c.id) ?? { pending: 0, reviewing: 0, approved: 0 }
		const onTimePercentage = c.completedProjects > 0 ? 100 : 100
		const createdAtIso = c.createdAt ? new Date(c.createdAt).toISOString().split("T")[0] : null
		return {
			id: c.id,
			name: c.name,
			rut: c.rut,
			image: c.image || "/placeholder.svg?height=40&width=40",
			activeUsers: c.activeUsers,
			activeWorkOrders: c.activeWorkOrders,
			vehicles: c.vehicles,
			pendingDocuments: docs.pending,
			approvedDocuments: docs.approved,
			reviewingDocuments: docs.reviewing,
			createdAt: createdAtIso,
			lastActivity: createdAtIso,
			completedProjects: c.completedProjects,
			onTimePercentage,
		}
	})

	// Work order status breakdown per company (top 10 by volume).
	const woStatus = await db.query<{
		company: string
		planned: number
		inProgress: number
		completed: number
		cancelled: number
	}>(
		`SELECT c.name AS company,
			COUNT(*) FILTER (WHERE wo.status = 'PLANNED')::int AS planned,
			COUNT(*) FILTER (WHERE wo.status = 'IN_PROGRESS')::int AS "inProgress",
			COUNT(*) FILTER (WHERE wo.status = 'COMPLETED')::int AS completed,
			COUNT(*) FILTER (WHERE wo.status = 'CANCELLED')::int AS cancelled
		 FROM "company" c
		 JOIN "work_order" wo ON wo."companyId" = c.id AND wo."deletedAt" IS NULL
		 GROUP BY c.id, c.name
		 ORDER BY COUNT(*) DESC
		 LIMIT 10`,
	)
	const workOrderStatusData = woStatus.rows

	const topCompaniesData = [...companiesData]
		.sort((a, b) => b.activeWorkOrders - a.activeWorkOrders)
		.slice(0, 5)
		.map((c) => ({
			name: c.name.split(" ")[0],
			workOrders: c.activeWorkOrders,
			users: c.activeUsers,
		}))

	const monthShort = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
	const registrationTrendData = monthShort.map((month, i) => ({
		month,
		companies: companiesData.filter(
			(c) => c.createdAt && new Date(c.createdAt).getMonth() === i,
		).length,
	}))

	return HttpResponse.json({
		companiesData,
		workOrderStatusData,
		workEntryActivityData: [],
		topCompaniesData,
		registrationTrendData,
		complianceByAreaData: [
			{ name: "Seguridad", rate: 92 },
			{ name: "Ambiental", rate: 87 },
			{ name: "Técnica", rate: 95 },
			{ name: "Laboral", rate: 89 },
			{ name: "Vehículos", rate: 78 },
		],
	})
})

const listHandler = http.get("*/api/companies", async ({ request }) => {
	const url = new URL(request.url)
	const page = parseInt(url.searchParams.get("page") || "1", 10)
	const limit = parseInt(url.searchParams.get("limit") || "10", 10)
	const search = url.searchParams.get("search") || ""
	const orderByRaw = url.searchParams.get("orderBy") || "name"
	const orderBy = SAFE_LIST_SORT.has(orderByRaw) ? orderByRaw : "name"
	const order = url.searchParams.get("order") === "desc" ? "DESC" : "ASC"
	const showAll = url.searchParams.get("showAll") === "true"
	const activeStatusRaw = url.searchParams.get("activeStatus")
	const activeStatus =
		activeStatusRaw === "inactive" ? "inactive" : activeStatusRaw === "all" ? "all" : "active"
	const skip = (page - 1) * limit

	const db = await getDemoDb()
	const conditions: string[] = []
	const params: unknown[] = []

	if (!showAll || activeStatus === "active") {
		conditions.push(`c."isActive" = true`)
	} else if (activeStatus === "inactive") {
		conditions.push(`c."isActive" = false`)
	}

	if (search) {
		params.push(`%${search}%`)
		conditions.push(`(c.name ILIKE $${params.length} OR c.rut ILIKE $${params.length})`)
	}

	const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : ""

	const totalRes = await db.query<{ count: string }>(
		`SELECT COUNT(*)::text AS count FROM "company" c ${where}`,
		params,
	)
	const total = parseInt(totalRes.rows[0]?.count ?? "0", 10)

	const listRes = await db.query<{
		id: string
		rut: string
		name: string
		image: string | null
		isActive: boolean
		createdAt: string
		createdById: string | null
		createdBy_id: string | null
		createdBy_name: string | null
	}>(
		`SELECT c.id, c.rut, c.name, c.image, c."isActive", c."createdAt", c."createdById",
			u.id AS "createdBy_id", u.name AS "createdBy_name"
		 FROM "company" c
		 LEFT JOIN "user" u ON u.id = c."createdById"
		 ${where}
		 ORDER BY c."${orderBy}" ${order}
		 LIMIT ${limit} OFFSET ${skip}`,
		params,
	)

	const companyIds = listRes.rows.map((r) => r.id)
	const supervisorsByCompany = new Map<
		string,
		Array<{ id: string; name: string; isSupervisor: boolean }>
	>()
	const startupFoldersByCompany = new Map<string, Array<{ id: string; status: string }>>()

	if (companyIds.length) {
		const placeholders = companyIds.map((_, i) => `$${i + 1}`).join(", ")
		const supervisors = await db.query<{
			id: string
			name: string
			companyId: string
		}>(
			`SELECT id, name, "companyId"
			 FROM "user"
			 WHERE "companyId" IN (${placeholders})
			   AND "isActive" = true
			   AND "isSupervisor" = true`,
			companyIds,
		)
		for (const s of supervisors.rows) {
			if (!supervisorsByCompany.has(s.companyId)) supervisorsByCompany.set(s.companyId, [])
			supervisorsByCompany
				.get(s.companyId)!
				.push({ id: s.id, name: s.name, isSupervisor: true })
		}

		const startupFolders = await db.query<{
			id: string
			status: string
			companyId: string
		}>(
			`SELECT id, status, "companyId" FROM "startup_folder" WHERE "companyId" IN (${placeholders})`,
			companyIds,
		)
		for (const f of startupFolders.rows) {
			if (!startupFoldersByCompany.has(f.companyId)) startupFoldersByCompany.set(f.companyId, [])
			startupFoldersByCompany.get(f.companyId)!.push({ id: f.id, status: f.status })
		}
	}

	const companies = listRes.rows.map((row) => ({
		id: row.id,
		rut: row.rut,
		name: row.name,
		image: row.image,
		isActive: row.isActive,
		createdAt: row.createdAt,
		createdBy: row.createdBy_id
			? { id: row.createdBy_id, name: row.createdBy_name }
			: null,
		users: supervisorsByCompany.get(row.id) ?? [],
		StartupFolders: startupFoldersByCompany.get(row.id) ?? [],
	}))

	return HttpResponse.json({
		companies,
		total,
		pages: Math.max(1, Math.ceil(total / limit)),
	})
})

// ORDER MATTERS: vehicles + stats must be matched before the :companyId catch-all.
export const companyHandlers = [vehiclesHandler, statsHandler, detailHandler, listHandler]
