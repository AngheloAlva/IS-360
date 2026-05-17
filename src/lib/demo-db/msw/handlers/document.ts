import { http, HttpResponse } from "msw"

import { getDemoDb } from "@/lib/demo-db/client"

const SAFE_ORDER = new Set(["name", "createdAt"])

interface FileRow {
	id: string
	name: string
	code: string | null
	url: string
	size: number
	type: string
	description: string | null
	revisionCount: number
	expirationDate: string | null
	registrationDate: string | null
	updatedAt: string
	folderId: string | null
	userId: string
	area: string | null
	isActive: boolean
	user_id: string | null
	user_name: string | null
}

interface FolderRow {
	id: string
	slug: string
	name: string
	description: string | null
	area: string
	type: string
	parentId: string | null
	userId: string
	createdAt: string
	updatedAt: string
	user_id: string | null
	user_name: string | null
	fileCount: string
	subFolderCount: string
}

function buildFile(row: FileRow) {
	return {
		id: row.id,
		name: row.name,
		code: row.code,
		url: row.url,
		size: row.size,
		type: row.type,
		description: row.description,
		revisionCount: row.revisionCount,
		expirationDate: row.expirationDate,
		registrationDate: row.registrationDate,
		updatedAt: row.updatedAt,
		folderId: row.folderId,
		userId: row.userId,
		area: row.area,
		isActive: row.isActive,
		user: row.user_id ? { id: row.user_id, name: row.user_name } : null,
		comments: [] as unknown[],
	}
}

function buildFolder(row: FolderRow) {
	return {
		id: row.id,
		slug: row.slug,
		name: row.name,
		description: row.description,
		area: row.area,
		type: row.type,
		parentId: row.parentId,
		userId: row.userId,
		createdAt: row.createdAt,
		updatedAt: row.updatedAt,
		user: row.user_id ? { id: row.user_id, name: row.user_name } : null,
		_count: {
			files: parseInt(row.fileCount ?? "0", 10),
			subFolders: parseInt(row.subFolderCount ?? "0", 10),
		},
	}
}

async function loadCommentsForFiles(fileIds: string[]) {
	if (!fileIds.length) return new Map<string, unknown[]>()
	const db = await getDemoDb()
	const placeholders = fileIds.map((_, i) => `$${i + 1}`).join(", ")
	const res = await db.query<{
		id: string
		fileId: string
		content: string
		createdAt: string
		u_id: string | null
		u_name: string | null
	}>(
		`SELECT c.id, c."fileId", c.content, c."createdAt",
			u.id AS "u_id", u.name AS "u_name"
		 FROM "file_comment" c
		 LEFT JOIN "user" u ON u.id = c."userId"
		 WHERE c."fileId" IN (${placeholders})
		 ORDER BY c."createdAt" ASC`,
		fileIds,
	)
	const map = new Map<string, unknown[]>()
	for (const c of res.rows) {
		const list = map.get(c.fileId) ?? []
		list.push({
			id: c.id,
			content: c.content,
			createdAt: c.createdAt,
			user: c.u_id ? { id: c.u_id, name: c.u_name } : null,
		})
		map.set(c.fileId, list)
	}
	return map
}

const treeHandler = http.get("*/api/document-management/tree", async ({ request }) => {
	const url = new URL(request.url)
	const area = url.searchParams.get("area")
	const folderId = url.searchParams.get("folderId") || null
	if (!area) {
		return HttpResponse.json({ error: "Area is required" }, { status: 400 })
	}

	const db = await getDemoDb()
	const folderRes = await db.query<{
		id: string
		name: string
		slug: string
		fileCount: string
		subFolderCount: string
	}>(
		`SELECT f.id, f.name, f.slug,
			(SELECT COUNT(*)::text FROM "file" x WHERE x."folderId" = f.id AND x."isActive" = true) AS "fileCount",
			(SELECT COUNT(*)::text FROM "folder" y WHERE y."parentId" = f.id AND y."isActive" = true) AS "subFolderCount"
		 FROM "folder" f
		 WHERE f.area = $1 AND f."isActive" = true
		   AND ${folderId ? `f."parentId" = $2` : `f."parentId" IS NULL`}
		 ORDER BY f.name ASC`,
		folderId ? [area, folderId] : [area],
	)
	const folders = folderRes.rows.map((row) => ({
		id: row.id,
		name: row.name,
		slug: row.slug,
		type: "folder" as const,
		_count: {
			files: parseInt(row.fileCount ?? "0", 10),
			subFolders: parseInt(row.subFolderCount ?? "0", 10),
		},
		hasChildren:
			parseInt(row.fileCount ?? "0", 10) > 0 || parseInt(row.subFolderCount ?? "0", 10) > 0,
	}))

	const fileRes = await db.query<{ id: string; url: string; name: string; code: string | null }>(
		`SELECT id, url, name, code FROM "file"
		 WHERE area = $1 AND "isActive" = true
		   AND ${folderId ? `"folderId" = $2` : `"folderId" IS NULL`}
		 ORDER BY name ASC`,
		folderId ? [area, folderId] : [area],
	)
	const files = fileRes.rows.map((row) => ({ ...row, type: "file" as const }))

	return HttpResponse.json({ folders, files })
})

const chartsHandler = http.get("*/api/documents/charts", async () => {
	return HttpResponse.json({
		areaData: [],
		expirationData: [],
		responsibleData: [],
		recentChanges: [],
		activityByDay: [],
		changesPerDay: [],
		metrics: { totalFolders: 0 },
		fileTypes: [],
		monthlyUploads: [],
		topContributors: [],
	})
})

const searchHandler = http.get("*/api/documents/search", async ({ request }) => {
	const url = new URL(request.url)
	const page = parseInt(url.searchParams.get("page") || "1", 10)
	const limit = parseInt(url.searchParams.get("limit") || "15", 10)
	const search = url.searchParams.get("search") || ""
	const expiration = url.searchParams.get("expiration") || "all"
	const skip = (page - 1) * limit

	const conditions: string[] = [`f."isActive" = true`]
	const params: unknown[] = []
	if (search) {
		params.push(`%${search}%`)
		conditions.push(
			`(f.name ILIKE $${params.length} OR f.description ILIKE $${params.length})`,
		)
	}

	const now = new Date()
	const at = (days: number) =>
		new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString()
	switch (expiration) {
		case "vencido":
			params.push(now.toISOString())
			conditions.push(`f."expirationDate" < $${params.length}`)
			break
		case "vence-esta-semana":
			params.push(now.toISOString(), at(7))
			conditions.push(
				`f."expirationDate" >= $${params.length - 1} AND f."expirationDate" < $${params.length}`,
			)
			break
		case "vence-en-8-15-dias":
			params.push(at(7), at(15))
			conditions.push(
				`f."expirationDate" >= $${params.length - 1} AND f."expirationDate" < $${params.length}`,
			)
			break
		case "vence-en-16-30-dias":
			params.push(at(15), at(30))
			conditions.push(
				`f."expirationDate" >= $${params.length - 1} AND f."expirationDate" < $${params.length}`,
			)
			break
		case "vence-en-31-60-dias":
			params.push(at(30), at(60))
			conditions.push(
				`f."expirationDate" >= $${params.length - 1} AND f."expirationDate" < $${params.length}`,
			)
			break
		case "vence-en-61-90-dias":
			params.push(at(60), at(90))
			conditions.push(
				`f."expirationDate" >= $${params.length - 1} AND f."expirationDate" < $${params.length}`,
			)
			break
		case "vence-despues-de-90-dias":
			params.push(at(90))
			conditions.push(`f."expirationDate" >= $${params.length}`)
			break
	}

	const where = `WHERE ${conditions.join(" AND ")}`

	const db = await getDemoDb()
	const res = await db.query<FileRow>(
		`SELECT f.*, u.id AS "user_id", u.name AS "user_name"
		 FROM "file" f
		 LEFT JOIN "user" u ON u.id = f."userId"
		 ${where}
		 ORDER BY f."createdAt" DESC
		 LIMIT ${limit} OFFSET ${skip}`,
		params,
	)
	const fileIds = res.rows.map((r) => r.id)
	const commentsByFile = await loadCommentsForFiles(fileIds)
	const files = res.rows.map((row) => ({
		...buildFile(row),
		comments: commentsByFile.get(row.id) ?? [],
	}))

	return HttpResponse.json({ files })
})

const listHandler = http.get("*/api/documents", async ({ request }) => {
	const url = new URL(request.url)
	const area = url.searchParams.get("area")
	const folderId = url.searchParams.get("folderId") || null
	const orderByRaw = url.searchParams.get("orderBy") || "name"
	const orderBy = SAFE_ORDER.has(orderByRaw) ? orderByRaw : "name"
	const order = url.searchParams.get("order") === "desc" ? "DESC" : "ASC"

	if (!area) {
		return HttpResponse.json({ files: [], folders: [] })
	}

	const db = await getDemoDb()
	const filesRes = await db.query<FileRow>(
		`SELECT f.*, u.id AS "user_id", u.name AS "user_name"
		 FROM "file" f
		 LEFT JOIN "user" u ON u.id = f."userId"
		 WHERE f."isActive" = true AND f.area = $1
		   AND ${folderId ? `f."folderId" = $2` : `f."folderId" IS NULL`}
		 ORDER BY f."${orderBy}" ${order}`,
		folderId ? [area, folderId] : [area],
	)
	const fileIds = filesRes.rows.map((r) => r.id)
	const commentsByFile = await loadCommentsForFiles(fileIds)
	const files = filesRes.rows.map((row) => ({
		...buildFile(row),
		comments: commentsByFile.get(row.id) ?? [],
	}))

	const foldersRes = await db.query<FolderRow>(
		`SELECT f.*,
			u.id AS "user_id", u.name AS "user_name",
			(SELECT COUNT(*)::text FROM "file" x WHERE x."folderId" = f.id AND x."isActive" = true) AS "fileCount",
			(SELECT COUNT(*)::text FROM "folder" y WHERE y."parentId" = f.id AND y."isActive" = true) AS "subFolderCount"
		 FROM "folder" f
		 LEFT JOIN "user" u ON u.id = f."userId"
		 WHERE f."isActive" = true AND f.area = $1
		   AND ${folderId ? `f."parentId" = $2` : `f."parentId" IS NULL`}
		 ORDER BY f."${orderBy}" ${order}`,
		folderId ? [area, folderId] : [area],
	)
	const folders = foldersRes.rows.map(buildFolder)

	return HttpResponse.json({ files, folders })
})

const startupGuideHandler = http.get("*/api/startup-guide-documents", async ({ request }) => {
	const url = new URL(request.url)
	const visibility = url.searchParams.get("visibility")
	const includeInactive = url.searchParams.get("includeInactive") === "true"

	const conditions: string[] = []
	const params: unknown[] = []
	if (!includeInactive) conditions.push(`d."isActive" = true`)
	if (visibility) {
		if (visibility === "BASIC") {
			conditions.push(`d.visibility = ANY (ARRAY['BASIC','BOTH']::"StartupGuideDocumentVisibility"[])`)
		} else if (visibility === "FULL") {
			conditions.push(`d.visibility = ANY (ARRAY['FULL','BOTH']::"StartupGuideDocumentVisibility"[])`)
		} else {
			params.push(visibility)
			conditions.push(`d.visibility = $${params.length}::"StartupGuideDocumentVisibility"`)
		}
	}
	const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : ""

	const db = await getDemoDb()
	const res = await db.query<{
		id: string
		name: string
		description: string | null
		url: string
		type: string
		size: number | null
		visibility: string
		order: number | null
		isActive: boolean
		createdAt: string
		updatedAt: string
		cb_id: string | null
		cb_name: string | null
	}>(
		`SELECT d.id, d.name, d.description, d.url, d.type, d.size, d.visibility, d."order",
			d."isActive", d."createdAt", d."updatedAt",
			u.id AS "cb_id", u.name AS "cb_name"
		 FROM "startup_guide_document" d
		 LEFT JOIN "user" u ON u.id = d."createdById"
		 ${where}
		 ORDER BY d."order" ASC NULLS LAST, d."createdAt" DESC`,
		params,
	)

	const documents = res.rows.map((row) => ({
		id: row.id,
		name: row.name,
		description: row.description,
		url: row.url,
		type: row.type,
		size: row.size,
		visibility: row.visibility,
		order: row.order,
		isActive: row.isActive,
		createdAt: row.createdAt,
		updatedAt: row.updatedAt,
		createdBy: row.cb_id ? { id: row.cb_id, name: row.cb_name } : null,
	}))

	return HttpResponse.json(documents)
})

const fileSasHandler = http.post("*/api/file", async ({ request }) => {
	// Demo: uploadFilesToCloud has been replaced and no longer hits this endpoint,
	// but a few legacy callers may still POST here. Return placeholder URLs so the
	// caller's URL.parse-style assumptions don't throw.
	const body = (await request.json().catch(() => ({}))) as { filenames?: string[] }
	const urls = (body.filenames ?? []).map(
		(name) => `https://demo.local/${encodeURIComponent(name)}?demo=1`,
	)
	return HttpResponse.json({ urls })
})

const fileSasReadHandler = http.get("*/api/file", async ({ request }) => {
	const url = new URL(request.url)
	const filename = url.searchParams.get("filename")
	return HttpResponse.json({
		url: filename ? `https://demo.local/${encodeURIComponent(filename)}?demo=1` : "",
	})
})

// ORDER MATTERS: specific subpaths before catch-alls
export const documentHandlers = [
	treeHandler,
	chartsHandler,
	searchHandler,
	listHandler,
	startupGuideHandler,
	fileSasReadHandler,
	fileSasHandler,
]
