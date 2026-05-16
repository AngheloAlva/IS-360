import { http, HttpResponse } from "msw"

import { getDemoDb } from "@/lib/demo-db/client"

const listHandler = http.get("*/api/users", async ({ request }) => {
	const url = new URL(request.url)
	const page = parseInt(url.searchParams.get("page") || "1", 10)
	const limit = parseInt(url.searchParams.get("limit") || "10", 10)
	const search = url.searchParams.get("search") || ""
	const skip = (page - 1) * limit

	const db = await getDemoDb()
	const where = search
		? `WHERE u."isActive" = true AND (u.name ILIKE $1 OR u.email ILIKE $1)`
		: `WHERE u."isActive" = true`
	const params = search ? [`%${search}%`] : []

	const totalResult = await db.query<{ value: number }>(
		`SELECT COUNT(*)::int AS value FROM "user" u ${where}`,
		params
	)
	const total = totalResult.rows[0]?.value ?? 0

	const usersResult = await db.query<Record<string, unknown>>(
		`SELECT
			u.id, u.name, u.email, u.rut, u.image, u.role, u.phone,
			u."internalRole", u.area, u."createdAt", u."isSupervisor",
			u."allowedModules", u."allowedCompanies", u."documentAreas",
			c.name AS "companyName"
		 FROM "user" u
		 LEFT JOIN "company" c ON c.id = u."companyId"
		 ${where}
		 ORDER BY u."createdAt" DESC
		 LIMIT ${limit} OFFSET ${skip}`,
		params
	)

	const users = usersResult.rows.map((row) => ({
		id: row.id,
		name: row.name,
		email: row.email,
		rut: row.rut,
		image: row.image ?? null,
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

export const userHandlers = [listHandler]
