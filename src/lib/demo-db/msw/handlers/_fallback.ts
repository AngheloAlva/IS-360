import { http, HttpResponse } from "msw"

/**
 * Catch-all handler for any /api/* route without a dedicated implementation.
 * Returns shape-friendly stubs so the UI keeps rendering without errors:
 * - GET → empty array
 * - others → { ok: true }
 *
 * Real handlers are registered BEFORE this one in `handlers/index.ts` so they
 * take precedence. This only fires for endpoints we have not implemented yet.
 */
export const fallbackHandlers = [
	http.all("*/api/*", ({ request }) => {
		const url = new URL(request.url)
		if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
			console.warn(
				`[demo-db/msw] stub respondió a ${request.method} ${url.pathname}`
			)
		}
		if (request.method === "GET") {
			return HttpResponse.json([])
		}
		return HttpResponse.json({ ok: true })
	}),
]
