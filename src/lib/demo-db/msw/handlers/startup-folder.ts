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

/* ─────────────── helpers to build per-subfolder document counts ─────────────── */

interface DocStatusRow {
	folderId: string
	status: string
}

interface DocCounts {
	total: number
	approved: number
	rejected: number
	submitted: number
	expired: number
	draft: number
}

function emptyCounts(): DocCounts {
	return { total: 0, approved: 0, rejected: 0, submitted: 0, expired: 0, draft: 0 }
}

function bucket(counts: DocCounts, status: string) {
	counts.total++
	switch (status) {
		case "APPROVED":
		case "NOT_APPLIED":
			counts.approved++
			break
		case "REJECTED":
			counts.rejected++
			break
		case "SUBMITTED":
			counts.submitted++
			break
		case "EXPIRED":
		case "TO_UPDATE":
			counts.expired++
			break
		default:
			counts.draft++
	}
}

async function fetchDocCountsByFolder(
	documentTable: string,
	folderIds: string[],
): Promise<Map<string, DocCounts>> {
	const out = new Map<string, DocCounts>()
	if (folderIds.length === 0) return out
	const rows = await query<DocStatusRow>(
		`SELECT "folderId", status FROM "${documentTable}" WHERE "folderId" = ANY($1::text[])`,
		[folderIds],
	)
	for (const r of rows) {
		const c = out.get(r.folderId) ?? emptyCounts()
		bucket(c, r.status)
		out.set(r.folderId, c)
	}
	for (const id of folderIds) if (!out.has(id)) out.set(id, emptyCounts())
	return out
}

function isCompleted(folderStatus: string, counts: DocCounts): boolean {
	if (folderStatus === "APPROVED") return true
	if (folderStatus === "DRAFT" || folderStatus === "SUBMITTED" || folderStatus === "REJECTED") {
		return false
	}
	return counts.total > 0 && counts.approved === counts.total
}

/* ─────────────── /api/startup-folders (main list) ─────────────── */

const mainListHandler = http.get("*/api/startup-folders", async ({ request }) => {
	const url = new URL(request.url)
	const companyId = url.searchParams.get("companyId")
	const showArchived = url.searchParams.get("showArchived") === "true"
	const archivedOnly = url.searchParams.get("archivedOnly") === "true"

	if (!companyId) {
		return HttpResponse.json([])
	}

	const archiveClause = archivedOnly
		? `AND sf."isArchived" = true`
		: showArchived
			? ""
			: `AND sf."isArchived" = false`

	const startupFolders = await query<{
		id: string
		name: string
		type: string
		status: string
		createdAt: Date
		updatedAt: Date
		isArchived: boolean
		moreMonthDuration: boolean
		companyId: string
		c_name: string
		c_rut: string
		c_image: string | null
	}>(
		`SELECT sf.id, sf.name, sf.type, sf.status, sf."createdAt", sf."updatedAt",
		        sf."isArchived", sf."moreMonthDuration", sf."companyId",
		        c.name AS c_name, c.rut AS c_rut, c.image AS c_image
		 FROM "startup_folder" sf
		 LEFT JOIN "company" c ON c.id = sf."companyId"
		 WHERE sf."companyId" = $1 AND sf."isDeleted" = false ${archiveClause}
		 ORDER BY sf."createdAt" ASC`,
		[companyId],
	)

	if (startupFolders.length === 0) return HttpResponse.json([])

	const folderIds = startupFolders.map((f) => f.id)

	// Fetch sub-folders in parallel
	const [basics, safety, environmental, environment, techSpecs, workers, vehicles] =
		await Promise.all([
			query<Row>(
				`SELECT bf.id, bf.status, bf."createdAt", bf."updatedAt", bf."startupFolderId",
				        bf."workerId", u.name AS w_name
				 FROM "basic_folder" bf
				 LEFT JOIN "user" u ON u.id = bf."workerId"
				 WHERE bf."startupFolderId" = ANY($1::text[]) AND u."isActive" = true`,
				[folderIds],
			),
			query<Row>(
				`SELECT id, status, "createdAt", "updatedAt", "startupFolderId"
				 FROM "safety_and_health_folder" WHERE "startupFolderId" = ANY($1::text[])`,
				[folderIds],
			),
			query<Row>(
				`SELECT id, status, "createdAt", "updatedAt", "startupFolderId"
				 FROM "environmental_folder" WHERE "startupFolderId" = ANY($1::text[])`,
				[folderIds],
			),
			query<Row>(
				`SELECT id, status, "createdAt", "updatedAt", "startupFolderId"
				 FROM "environment_folder" WHERE "startupFolderId" = ANY($1::text[])`,
				[folderIds],
			),
			query<Row>(
				`SELECT id, status, "createdAt", "updatedAt", "startupFolderId"
				 FROM "tech_specs_folder" WHERE "startupFolderId" = ANY($1::text[])`,
				[folderIds],
			),
			query<Row>(
				`SELECT wf.id, wf.status, wf."isDriver", wf."createdAt", wf."updatedAt",
				        wf."startupFolderId", wf."workerId", u.name AS w_name
				 FROM "worker_folders" wf
				 LEFT JOIN "user" u ON u.id = wf."workerId"
				 WHERE wf."startupFolderId" = ANY($1::text[]) AND u."isActive" = true`,
				[folderIds],
			),
			query<Row>(
				`SELECT vf.id, vf.status, vf."createdAt", vf."updatedAt",
				        vf."startupFolderId", vf."vehicleId", v.plate AS v_plate
				 FROM "vehicle_folders" vf
				 LEFT JOIN "vehicle" v ON v.id = vf."vehicleId"
				 WHERE vf."startupFolderId" = ANY($1::text[]) AND v."isActive" = true`,
				[folderIds],
			),
		])

	// Build doc-counts maps per folder type
	const [basicCounts, safetyCounts, envtalCounts, envCounts, techCounts, workerCounts, vehicleCounts] =
		await Promise.all([
			fetchDocCountsByFolder("basic_document", basics.map((f) => f.id as string)),
			fetchDocCountsByFolder("safety_and_health_document", safety.map((f) => f.id as string)),
			fetchDocCountsByFolder("environmental_document", environmental.map((f) => f.id as string)),
			fetchDocCountsByFolder("environment_document", environment.map((f) => f.id as string)),
			fetchDocCountsByFolder("tech_specs_document", techSpecs.map((f) => f.id as string)),
			fetchDocCountsByFolder("worker_document", workers.map((f) => f.id as string)),
			fetchDocCountsByFolder("vehicle_document", vehicles.map((f) => f.id as string)),
		])

	const decorate = (
		subFolders: Row[],
		countsMap: Map<string, DocCounts>,
		extra?: (sf: Row) => Record<string, unknown>,
	) =>
		subFolders.map((sf) => {
			const counts = countsMap.get(sf.id as string) ?? emptyCounts()
			return {
				id: sf.id,
				status: sf.status,
				createdAt: sf.createdAt,
				updatedAt: sf.updatedAt,
				_count: { documents: counts.total },
				documentCounts: counts,
				isCompleted: isCompleted(sf.status as string, counts),
				...(extra ? extra(sf) : {}),
			}
		})

	const byStartup = <T extends Row>(rows: T[]) => {
		const m = new Map<string, T[]>()
		for (const r of rows) {
			const key = r.startupFolderId as string
			const arr = m.get(key) ?? []
			arr.push(r)
			m.set(key, arr)
		}
		return m
	}

	const basicByStartup = byStartup(basics)
	const safetyByStartup = byStartup(safety)
	const envtalByStartup = byStartup(environmental)
	const envByStartup = byStartup(environment)
	const techByStartup = byStartup(techSpecs)
	const workersByStartup = byStartup(workers)
	const vehiclesByStartup = byStartup(vehicles)

	const processed = startupFolders.map((sf) => ({
		id: sf.id,
		name: sf.name,
		type: sf.type,
		status: sf.status,
		createdAt: sf.createdAt,
		updatedAt: sf.updatedAt,
		isArchived: sf.isArchived,
		moreMonthDuration: sf.moreMonthDuration,
		company: {
			id: sf.companyId,
			rut: sf.c_rut,
			name: sf.c_name,
			image: sf.c_image,
		},
		basicFolder: decorate(basicByStartup.get(sf.id) ?? [], basicCounts, (r) => ({
			worker: { name: r.w_name },
			workerId: r.workerId,
		})),
		safetyAndHealthFolders: decorate(safetyByStartup.get(sf.id) ?? [], safetyCounts),
		environmentalFolders: decorate(envtalByStartup.get(sf.id) ?? [], envtalCounts),
		environmentFolders: decorate(envByStartup.get(sf.id) ?? [], envCounts),
		techSpecsFolders: decorate(techByStartup.get(sf.id) ?? [], techCounts),
		workersFolders: decorate(workersByStartup.get(sf.id) ?? [], workerCounts, (r) => ({
			isDriver: r.isDriver,
			worker: { name: r.w_name },
			workerId: r.workerId,
		})),
		vehiclesFolders: decorate(vehiclesByStartup.get(sf.id) ?? [], vehicleCounts, (r) => ({
			vehicle: { plate: r.v_plate },
			vehicleId: r.vehicleId,
		})),
	}))

	return HttpResponse.json(processed)
})

/* ─────────────── /api/startup-folders/list (admin list) ─────────────── */

const listHandler = http.get("*/api/startup-folders/list", async () => {
	const companies = await query<{
		id: string
		name: string
		rut: string
		image: string | null
		createdAt: Date
		updatedAt: Date
		isActive: boolean
	}>(
		`SELECT id, name, rut, image, "createdAt", "updatedAt", "isActive"
		 FROM "company" WHERE "isActive" = true ORDER BY name ASC`,
	)

	if (companies.length === 0) return HttpResponse.json([])

	const companyIds = companies.map((c) => c.id)

	const startupFolders = await query<{
		id: string
		name: string
		type: string
		status: string
		createdAt: Date
		isDeleted: boolean
		isArchived: boolean
		moreMonthDuration: boolean
		companyId: string
	}>(
		`SELECT id, name, type, status, "createdAt", "isDeleted", "isArchived",
		        "moreMonthDuration", "companyId"
		 FROM "startup_folder"
		 WHERE "companyId" = ANY($1::text[]) AND "isDeleted" = false AND "isArchived" = false
		 ORDER BY "createdAt" ASC`,
		[companyIds],
	)

	return HttpResponse.json(
		companies.map((c) => ({
			...c,
			StartupFolders: startupFolders
				.filter((sf) => sf.companyId === c.id)
				.map((sf) => ({
					id: sf.id,
					name: sf.name,
					type: sf.type,
					status: sf.status,
					createdAt: sf.createdAt,
					isDeleted: sf.isDeleted,
					isArchived: sf.isArchived,
					moreMonthDuration: sf.moreMonthDuration,
					workersFolders: [],
					vehiclesFolders: [],
					safetyAndHealthFolders: [],
					environmentalFolders: [],
					environmentFolders: [],
					basicFolders: [],
					techSpecsFolders: [],
				})),
		})),
	)
})

/* ─────────────── /api/startup-folders/stats ─────────────── */

const statsHandler = http.get("*/api/startup-folders/stats", async () => {
	const totalFolders = (await scalar<number>(
		`SELECT COUNT(*)::int AS value FROM "startup_folder" WHERE "isDeleted" = false`,
	)) ?? 0
	const totalFoldersActive = (await scalar<number>(
		`SELECT COUNT(*)::int AS value FROM "startup_folder"
		 WHERE "isDeleted" = false AND "isArchived" = false`,
	)) ?? 0
	const totalFoldersToReview = (await scalar<number>(
		`SELECT COUNT(*)::int AS value FROM "startup_folder"
		 WHERE "isDeleted" = false AND status = 'IN_PROGRESS'`,
	)) ?? 0
	const totalCompaniesApproved = (await scalar<number>(
		`SELECT COUNT(DISTINCT "companyId")::int AS value FROM "startup_folder"
		 WHERE "isDeleted" = false AND status = 'COMPLETED'`,
	)) ?? 0

	return HttpResponse.json({
		totalFolders,
		totalFoldersActive,
		totalFoldersToReview,
		totalCompaniesApproved,
		charts: { documentsByStatus: [], subfoldersByType: [] },
	})
})

/* ─────────────── /api/startup-folders/by-company/:companyId ─────────────── */

const byCompanyHandler = http.get(
	"*/api/startup-folders/by-company/:companyId",
	async ({ params }) => {
		const companyId = params.companyId as string
		const rows = await query<{ id: string; name: string }>(
			`SELECT id, name FROM "startup_folder"
			 WHERE "companyId" = $1 AND "isDeleted" = false
			 ORDER BY "createdAt" ASC`,
			[companyId],
		)
		return HttpResponse.json(rows)
	},
)

/* ─────────────── /api/startup-guide-documents ─────────────── */

const guideDocumentsHandler = http.get("*/api/startup-guide-documents", async ({ request }) => {
	const url = new URL(request.url)
	const visibility = url.searchParams.get("visibility")
	const includeInactive = url.searchParams.get("includeInactive") === "true"

	let visibilityClause = ""
	const params: unknown[] = []
	if (!includeInactive) {
		params.push(true)
		visibilityClause += ` AND "isActive" = $${params.length}`
	}
	if (visibility === "BASIC") {
		visibilityClause += ` AND visibility IN ('BASIC', 'BOTH')`
	} else if (visibility === "FULL") {
		visibilityClause += ` AND visibility IN ('FULL', 'BOTH')`
	} else if (visibility) {
		params.push(visibility)
		visibilityClause += ` AND visibility = $${params.length}`
	}

	const rows = await query<Row>(
		`SELECT g.id, g.name, g.description, g.url, g.type, g.size, g.visibility,
		        g."order", g."isActive", g."createdAt", g."updatedAt",
		        g."createdById", u.name AS creator_name
		 FROM "startup_guide_document" g
		 LEFT JOIN "user" u ON u.id = g."createdById"
		 WHERE 1=1${visibilityClause}
		 ORDER BY g."order" ASC, g."createdAt" DESC`,
		params,
	)

	return HttpResponse.json(
		rows.map((r) => ({
			id: r.id,
			name: r.name,
			description: r.description,
			url: r.url,
			type: r.type,
			size: r.size,
			visibility: r.visibility,
			order: r.order,
			isActive: r.isActive,
			createdAt: r.createdAt,
			updatedAt: r.updatedAt,
			createdBy: r.createdById ? { id: r.createdById, name: r.creator_name } : null,
		})),
	)
})

/* ─────────────── exports ─────────────── */

// ORDER MATTERS: specific routes BEFORE catchall /api/startup-folders
export const startupFolderHandlers = [
	listHandler,
	statsHandler,
	byCompanyHandler,
	guideDocumentsHandler,
	mainListHandler,
]
