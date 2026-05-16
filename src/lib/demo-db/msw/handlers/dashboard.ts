import { http, HttpResponse } from "msw"

import { getDemoDb } from "@/lib/demo-db/client"

async function scalar<T = unknown>(sql: string, params: unknown[] = []): Promise<T | null> {
	const db = await getDemoDb()
	const result = await db.query<{ value: T }>(sql, params)
	return result.rows[0]?.value ?? null
}

// ─── /api/dashboard/company-stats ────────────────────────────────────────────
// Consumed by partner-company dashboard (/dashboard/inicio).

const companyStatsHandler = http.get("*/api/dashboard/company-stats", async ({ request }) => {
	const url = new URL(request.url)
	const companyId = url.searchParams.get("companyId")
	if (!companyId) {
		return HttpResponse.json({ error: "companyId requerido" }, { status: 400 })
	}

	const db = await getDemoDb()
	const companyRows = await db.query<{
		name: string
		rut: string
	}>(`SELECT name, rut FROM "company" WHERE id = $1`, [companyId])
	const company = companyRows.rows[0]
	if (!company) {
		return HttpResponse.json({ error: "Empresa no encontrada" }, { status: 404 })
	}

	const collaborators =
		(await scalar<number>(
			`SELECT COUNT(*)::int AS value FROM "user" WHERE "companyId" = $1 AND "isActive" = true`,
			[companyId]
		)) ?? 0

	const vehicles =
		(await scalar<number>(
			`SELECT COUNT(*)::int AS value FROM "vehicle" WHERE "companyId" = $1`,
			[companyId]
		)) ?? 0

	const activeWorkOrders =
		(await scalar<number>(
			`SELECT COUNT(*)::int AS value FROM "work_order"
			 WHERE "companyId" = $1 AND "deletedAt" IS NULL
			 AND status IN ('PLANNED', 'PENDING', 'IN_PROGRESS', 'CLOSURE_REQUESTED')`,
			[companyId]
		)) ?? 0

	const activeWorkPermits =
		(await scalar<number>(
			`SELECT COUNT(*)::int AS value FROM "work_permit"
			 WHERE "companyId" = $1 AND status = 'ACTIVE'`,
			[companyId]
		)) ?? 0

	return HttpResponse.json({
		companyInfo: {
			name: company.name,
			rut: company.rut,
			address: null,
			phone: null,
			email: "",
			representativeName: null,
			representativeEmail: null,
			representativePhone: null,
		},
		basicStats: {
			collaborators,
			activeWorkPermits,
			vehicles,
			activeWorkOrders,
		},
		workPermitTypes: [],
		recentAlerts: [],
		activities: [],
		safetyStats: {
			incidentCount: 0,
			lastTrainingDate: null,
			safetyScore: 100,
			riskLevel: "low" as const,
			pendingCertifications: 0,
		},
	})
})

export const dashboardHandlers = [companyStatsHandler]
