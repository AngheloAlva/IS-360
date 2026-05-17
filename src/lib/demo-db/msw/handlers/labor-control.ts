import { http, HttpResponse } from "msw"

import { getDemoUser } from "@/lib/demo-auth"
import { getDemoDb } from "@/lib/demo-db/client"

const listHandler = http.get("*/api/labor-control/list", async ({ request }) => {
	const user = getDemoUser()
	if (!user || user.accessRole !== "ADMIN") {
		return new HttpResponse("No autorizado", { status: 401 })
	}

	const url = new URL(request.url)
	const search = url.searchParams.get("search") || ""
	const order = (url.searchParams.get("order") || "desc").toLowerCase() === "asc" ? "ASC" : "DESC"
	const orderBy = url.searchParams.get("orderBy") || "name"
	const page = Number(url.searchParams.get("page") || 1)
	const limit = Number(url.searchParams.get("limit") || 15)
	const onlyWithReviewRequest = url.searchParams.get("onlyWithReviewRequest") === "true"
	const skip = (page - 1) * limit

	const safeOrderBy = ["name", "rut", "createdAt"].includes(orderBy) ? `c."${orderBy}"` : `c.name`

	const conditions: string[] = [
		`c."isActive" = true`,
		`EXISTS (SELECT 1 FROM "LaborControlFolder" lcf WHERE lcf."companyId" = c.id)`,
	]
	const params: unknown[] = []

	if (search) {
		params.push(`%${search}%`)
		conditions.push(`(c.name ILIKE $${params.length} OR c.rut ILIKE $${params.length})`)
	}
	if (onlyWithReviewRequest) {
		conditions.push(`EXISTS (
			SELECT 1 FROM "LaborControlFolder" lcf
			WHERE lcf."companyId" = c.id
			  AND (lcf.status = 'SUBMITTED'
			       OR EXISTS (SELECT 1 FROM "LaborControlDocument" d WHERE d."folderId" = lcf.id AND d.status = 'SUBMITTED'))
		)`)
	}

	const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : ""

	const db = await getDemoDb()
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
		submittedFolders: string
	}>(
		`SELECT c.id, c.rut, c.name, c.image,
			(SELECT COUNT(*)::text FROM "LaborControlFolder" lcf
			 WHERE lcf."companyId" = c.id AND lcf.status = 'SUBMITTED') AS "submittedFolders"
		 FROM "company" c
		 ${where}
		 ORDER BY ${safeOrderBy} ${order}
		 LIMIT ${limit} OFFSET ${skip}`,
		params,
	)

	const companiesWithLaborControlFolders = listRes.rows.map((row) => ({
		id: row.id,
		rut: row.rut,
		name: row.name,
		image: row.image,
		_count: {
			laborControlFolders: parseInt(row.submittedFolders ?? "0", 10),
		},
	}))

	return HttpResponse.json({
		total,
		pages: Math.ceil(total / limit),
		companiesWithLaborControlFolders,
	})
})

const byCompanyHandler = http.get(
	"*/api/labor-control/by-company/:companyId",
	async ({ request, params }) => {
		const user = getDemoUser()
		if (!user) {
			return new HttpResponse("No autorizado", { status: 401 })
		}

		const url = new URL(request.url)
		const order =
			(url.searchParams.get("order") || "desc").toLowerCase() === "asc" ? "ASC" : "DESC"
		const orderByRaw = url.searchParams.get("orderBy") || "createdAt"
		const orderBy = ["status", "createdAt"].includes(orderByRaw) ? `"${orderByRaw}"` : `"createdAt"`
		const page = Number(url.searchParams.get("page") || 1)
		const limit = Number(url.searchParams.get("limit") || 15)
		const skip = (page - 1) * limit
		const companyId = params.companyId as string

		const db = await getDemoDb()
		const totalRes = await db.query<{ count: string }>(
			`SELECT COUNT(*)::text AS count FROM "LaborControlFolder" WHERE "companyId" = $1`,
			[companyId],
		)
		const total = parseInt(totalRes.rows[0]?.count ?? "0", 10)

		const dataRes = await db.query(
			`SELECT id, status, "createdAt"
			 FROM "LaborControlFolder"
			 WHERE "companyId" = $1
			 ORDER BY ${orderBy} ${order}
			 LIMIT ${limit} OFFSET ${skip}`,
			[companyId],
		)

		return HttpResponse.json({ data: dataRes.rows, total })
	},
)

// ORDER MATTERS: by-company before list
export const laborControlHandlers = [byCompanyHandler, listHandler]
