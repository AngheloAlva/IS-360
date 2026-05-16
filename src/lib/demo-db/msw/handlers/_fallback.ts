import { http, HttpResponse } from "msw"

/**
 * Catch-all handler for any /api/* route without a dedicated implementation.
 *
 * GET strategy: infer a collection-shaped stub from the URL path so consumers
 * can do `data.users.map(...)`, `data.total`, etc. without crashing while we
 * wire real handlers. Examples:
 *   /api/users            → { users: [], total: 0, pages: 0 }
 *   /api/companies        → { companies: [], total: 0, pages: 0 }
 *   /api/maintenance-plans → { maintenancePlans: [], total: 0, pages: 0 }
 *
 * If the path is too generic to infer (single short segment that isn't a
 * collection word, dynamic id segments, etc.), returns an empty array — the
 * legacy default — so simple list consumers still work.
 *
 * Real handlers are registered BEFORE this one in `handlers/index.ts` so they
 * take precedence.
 */

const NON_COLLECTION_LAST_SEGMENT = new Set([
	"stats",
	"summary",
	"details",
	"count",
	"export",
	"check",
	"status",
	"me",
	"current",
	"session",
])

function toCamel(kebabOrSnake: string): string {
	return kebabOrSnake.replace(/[-_]([a-z])/g, (_, c: string) => c.toUpperCase())
}

function inferCollectionKey(pathname: string): string | null {
	const segments = pathname.split("/").filter(Boolean)
	const apiIdx = segments.indexOf("api")
	const after = apiIdx >= 0 ? segments.slice(apiIdx + 1) : segments
	if (after.length === 0) return null

	for (let i = after.length - 1; i >= 0; i--) {
		const seg = after[i]
		if (!seg) continue
		if (NON_COLLECTION_LAST_SEGMENT.has(seg)) continue
		// Skip ids: dynamic segments are usually long alphanumerics/uuids/cuids
		if (/^[a-z0-9]{16,}$/i.test(seg) || /^\d+$/.test(seg)) continue
		return toCamel(seg)
	}
	return null
}

type Stub = unknown[] | Record<string, unknown>

function buildStub(pathname: string): Stub {
	const key = inferCollectionKey(pathname)
	if (!key) return []
	return { [key]: [], total: 0, pages: 0 }
}

export const fallbackHandlers = [
	http.all("*/api/*", ({ request }) => {
		const url = new URL(request.url)
		if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
			console.warn(`[demo-db/msw] stub respondió a ${request.method} ${url.pathname}`)
		}
		if (request.method === "GET") {
			return HttpResponse.json(buildStub(url.pathname))
		}
		return HttpResponse.json({ ok: true })
	}),
]
