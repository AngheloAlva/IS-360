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
	// The stats page renders complex KPIs that aggregate across many modules.
	// For the demo we return empty structures with valid shape so the page renders.
	return HttpResponse.json({
		companiesData: [],
		workOrderStatusData: [],
		workEntryActivityData: [],
		topCompaniesData: [],
		registrationTrendData: [],
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
