import { http, HttpResponse } from "msw"

import { getDemoDb } from "@/lib/demo-db/client"

const USER_LIST_SORT = new Set(["name", "email", "rut", "area", "internalRole", "createdAt"])
const USER_BY_COMPANY_SORT = new Set([
	"name",
	"email",
	"rut",
	"internalRole",
	"internalArea",
	"isSupervisor",
	"isActive",
	"createdAt",
])

interface UserRow {
	id: string
	name: string
	email: string
	rut: string
	image: string | null
	role: string
	phone: string | null
	internalRole: string | null
	area: string | null
	createdAt: string
	isSupervisor: boolean | null
	allowedModules: string[] | null
	allowedCompanies: string[] | null
	documentAreas: string[] | null
	companyName: string | null
}

const statsHandler = http.get("*/api/users/stats", async () => {
	const db = await getDemoDb()
	const res = await db.query<{
		totalUsers: string
		twoFactorEnabled: string
		totalContractors: string
		totalSupervisors: string
	}>(
		`SELECT
			COUNT(*) FILTER (WHERE "accessRole" = 'ADMIN' AND "isActive" = true)::text AS "totalUsers",
			COUNT(*) FILTER (WHERE "accessRole" = 'ADMIN' AND "isActive" = true AND "twoFactorEnabled" = true)::text AS "twoFactorEnabled",
			COUNT(*) FILTER (WHERE "accessRole" = 'PARTNER_COMPANY' AND "isActive" = true)::text AS "totalContractors",
			COUNT(*) FILTER (WHERE "accessRole" = 'PARTNER_COMPANY' AND "isActive" = true AND "isSupervisor" = true)::text AS "totalSupervisors"
		 FROM "user"`,
	)
	const row = res.rows[0]
	return HttpResponse.json({
		basicStats: {
			totalUsers: parseInt(row?.totalUsers ?? "0", 10),
			twoFactorEnabled: parseInt(row?.twoFactorEnabled ?? "0", 10),
			totalContractors: parseInt(row?.totalContractors ?? "0", 10),
			totalSupervisors: parseInt(row?.totalSupervisors ?? "0", 10),
		},
	})
})

const generalSummaryHandler = http.get("*/api/users/general-summary", async () => {
	const db = await getDemoDb()
	const res = await db.query<{ count: string }>(
		`SELECT COUNT(*)::text AS count FROM "user"`,
	)
	return HttpResponse.json({ totalUsers: parseInt(res.rows[0]?.count ?? "0", 10) })
})

const monthlyMeetingHandler = http.post("*/api/users/monthly-meeting-invitation", async () => {
	// The cron-style bulk-email endpoint is a noop in the demo.
	return HttpResponse.json({
		ok: true,
		message: "Invitaciones enviadas (demo noop).",
		campaignKey: "demo",
		totalRecipients: 0,
		sent: 0,
		failed: 0,
		invalidEmails: [],
	})
})

const usersByCompanyHandler = http.get(
	"*/api/users/company/:companyId",
	async ({ request, params }) => {
		const companyId = params.companyId as string
		const url = new URL(request.url)
		const search = url.searchParams.get("search") || ""
		const page = parseInt(url.searchParams.get("page") || "1", 10)
		const limit = parseInt(url.searchParams.get("limit") || "10", 10)
		const showAll = url.searchParams.get("showAll") === "true"
		const sortByRaw = url.searchParams.get("sortBy") || "createdAt"
		const sortBy = USER_BY_COMPANY_SORT.has(sortByRaw) ? sortByRaw : "createdAt"
		const sortOrder = url.searchParams.get("sortOrder") === "asc" ? "ASC" : "DESC"
		const activeStatusRaw = url.searchParams.get("activeStatus")
		const activeStatus =
			activeStatusRaw === "inactive" ? "inactive" : activeStatusRaw === "all" ? "all" : "active"
		const skip = (page - 1) * limit

		const db = await getDemoDb()
		const conditions: string[] = [`u."companyId" = $1`]
		const params2: unknown[] = [companyId]
		if (!showAll || activeStatus === "active") {
			conditions.push(`u."isActive" = true`)
		} else if (activeStatus === "inactive") {
			conditions.push(`u."isActive" = false`)
		}
		if (search) {
			params2.push(`%${search}%`)
			conditions.push(
				`(u.name ILIKE $${params2.length} OR u.email ILIKE $${params2.length} OR u.rut ILIKE $${params2.length})`,
			)
		}
		const where = `WHERE ${conditions.join(" AND ")}`

		const totalRes = await db.query<{ count: string }>(
			`SELECT COUNT(*)::text AS count FROM "user" u ${where}`,
			params2,
		)
		const total = parseInt(totalRes.rows[0]?.count ?? "0", 10)

		const listRes = await db.query<{
			id: string
			rut: string
			name: string
			role: string
			phone: string | null
			email: string
			image: string | null
			isActive: boolean
			accreditationOverride: boolean | null
			companyId: string | null
			isSupervisor: boolean | null
			internalRole: string | null
			internalArea: string | null
		}>(
			`SELECT u.id, u.rut, u.name, u.role, u.phone, u.email, u.image,
				u."isActive", u."accreditationOverride", u."companyId",
				u."isSupervisor", u."internalRole", u."internalArea"
			 FROM "user" u
			 ${where}
			 ORDER BY u."${sortBy}" ${sortOrder}
			 LIMIT ${limit} OFFSET ${skip}`,
			params2,
		)

		// Compute isAccredited by checking if user has at least one APPROVED worker/basic folder
		const ids = listRes.rows.map((r) => r.id)
		const accreditedIds = new Set<string>()
		if (ids.length) {
			const placeholders = ids.map((_, i) => `$${i + 1}`).join(", ")
			const wfRes = await db.query<{ workerId: string }>(
				`SELECT DISTINCT wf."workerId"
				 FROM "worker_folders" wf
				 JOIN "startup_folder" sf ON sf.id = wf."startupFolderId"
				 WHERE wf."workerId" IN (${placeholders})
				   AND wf.status = 'APPROVED' AND sf."isArchived" = false`,
				ids,
			)
			for (const r of wfRes.rows) accreditedIds.add(r.workerId)
			const bfRes = await db.query<{ workerId: string }>(
				`SELECT DISTINCT bf."workerId"
				 FROM "basic_folder" bf
				 JOIN "startup_folder" sf ON sf.id = bf."startupFolderId"
				 WHERE bf."workerId" IN (${placeholders})
				   AND bf.status = 'APPROVED' AND sf."isArchived" = false`,
				ids,
			)
			for (const r of bfRes.rows) accreditedIds.add(r.workerId)
		}

		const users = listRes.rows.map((u) => ({
			...u,
			isAccredited: u.accreditationOverride ?? accreditedIds.has(u.id),
		}))

		return HttpResponse.json({
			total,
			users,
			pages: Math.max(1, Math.ceil(total / limit)),
		})
	},
)

const listHandler = http.get("*/api/users", async ({ request }) => {
	const url = new URL(request.url)
	const page = parseInt(url.searchParams.get("page") || "1", 10)
	const limit = parseInt(url.searchParams.get("limit") || "10", 10)
	const search = url.searchParams.get("search") || ""
	const area = url.searchParams.get("area") || "all"
	const orderByRaw = url.searchParams.get("orderBy") || "createdAt"
	const orderBy = USER_LIST_SORT.has(orderByRaw) ? orderByRaw : "createdAt"
	const order = url.searchParams.get("order") === "desc" ? "DESC" : "ASC"
	const skip = (page - 1) * limit

	const db = await getDemoDb()
	const conditions: string[] = [`u."accessRole" = 'ADMIN'`, `u."isActive" = true`]
	const params: unknown[] = []
	if (area !== "all") {
		params.push(area)
		conditions.push(`u.area = $${params.length}`)
	}
	if (search) {
		params.push(`%${search}%`)
		conditions.push(
			`(u.name ILIKE $${params.length} OR u.email ILIKE $${params.length} OR u.rut ILIKE $${params.length})`,
		)
	}
	const where = `WHERE ${conditions.join(" AND ")}`

	const totalRes = await db.query<{ count: string }>(
		`SELECT COUNT(*)::text AS count FROM "user" u ${where}`,
		params,
	)
	const total = parseInt(totalRes.rows[0]?.count ?? "0", 10)

	const listRes = await db.query<UserRow>(
		`SELECT
			u.id, u.name, u.email, u.rut, u.image, u.role, u.phone,
			u."internalRole", u.area, u."createdAt", u."isSupervisor",
			u."allowedModules", u."allowedCompanies", u."documentAreas",
			c.name AS "companyName"
		 FROM "user" u
		 LEFT JOIN "company" c ON c.id = u."companyId"
		 ${where}
		 ORDER BY u."${orderBy}" ${order}
		 LIMIT ${limit} OFFSET ${skip}`,
		params,
	)

	const users = listRes.rows.map((row) => ({
		id: row.id,
		name: row.name,
		email: row.email,
		rut: row.rut,
		image: row.image,
		role: row.role,
		phone: row.phone ?? "",
		internalRole: row.internalRole ?? "",
		area: row.area ?? null,
		createdAt: row.createdAt,
		isSupervisor: row.isSupervisor ?? false,
		allowedModules: row.allowedModules ?? [],
		allowedCompanies: row.allowedCompanies ?? [],
		documentAreas: row.documentAreas ?? [],
		company: row.companyName ? { name: row.companyName } : null,
	}))

	return HttpResponse.json({
		users,
		total,
		pages: Math.max(1, Math.ceil(total / limit)),
	})
})

// ORDER MATTERS: specific paths before the /api/users catch-all
export const userHandlers = [
	statsHandler,
	generalSummaryHandler,
	monthlyMeetingHandler,
	usersByCompanyHandler,
	listHandler,
]
