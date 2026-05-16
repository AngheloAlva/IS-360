import { http, HttpResponse } from "msw"

import { getDemoDb } from "@/lib/demo-db/client"

const listHandler = http.get("*/api/companies", async ({ request }) => {
	const url = new URL(request.url)
	const page = parseInt(url.searchParams.get("page") || "1", 10)
	const limit = parseInt(url.searchParams.get("limit") || "10", 10)
	const search = url.searchParams.get("search") || ""
	const activeStatus = url.searchParams.get("activeStatus") || "active"
	const skip = (page - 1) * limit

	const db = await getDemoDb()
	const conditions: string[] = []
	const params: unknown[] = []
	if (activeStatus === "active") conditions.push(`"isActive" = true`)
	else if (activeStatus === "inactive") conditions.push(`"isActive" = false`)
	if (search) {
		params.push(`%${search}%`)
		conditions.push(`(name ILIKE $${params.length} OR rut ILIKE $${params.length})`)
	}
	const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : ""

	const totalResult = await db.query<{ value: number }>(
		`SELECT COUNT(*)::int AS value FROM "company" ${where}`,
		params
	)
	const total = totalResult.rows[0]?.value ?? 0

	const companiesResult = await db.query<Record<string, unknown>>(
		`SELECT id, name, rut, image, "isActive", "createdAt", "createdById"
		 FROM "company" ${where}
		 ORDER BY "createdAt" DESC
		 LIMIT ${limit} OFFSET ${skip}`,
		params
	)

	const companyIds = companiesResult.rows
		.map((r) => r.id as string)
		.filter((id): id is string => Boolean(id))

	const usersByCompany = new Map<string, Array<{ id: string; name: string; isSupervisor: boolean; safetyTalks: never[] }>>()
	if (companyIds.length > 0) {
		const placeholders = companyIds.map((_, i) => `$${i + 1}`).join(", ")
		const userRows = await db.query<{ id: string; name: string; companyId: string; isSupervisor: boolean | null }>(
			`SELECT id, name, "companyId", "isSupervisor"
			 FROM "user"
			 WHERE "companyId" IN (${placeholders}) AND "isActive" = true`,
			companyIds
		)
		for (const u of userRows.rows) {
			if (!usersByCompany.has(u.companyId)) usersByCompany.set(u.companyId, [])
			usersByCompany.get(u.companyId)!.push({
				id: u.id,
				name: u.name,
				isSupervisor: u.isSupervisor === true,
				safetyTalks: [],
			})
		}
	}

	const companies = companiesResult.rows.map((row) => ({
		id: row.id,
		name: row.name,
		rut: row.rut,
		image: row.image ?? null,
		isActive: row.isActive,
		createdAt: row.createdAt,
		users: usersByCompany.get(row.id as string) ?? [],
		StartupFolders: [],
		createdBy: undefined,
	}))

	return HttpResponse.json({
		companies,
		total,
		pages: Math.max(1, Math.ceil(total / limit)),
	})
})

export const companyHandlers = [listHandler]
