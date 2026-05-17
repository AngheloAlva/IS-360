import { http, HttpResponse } from "msw"

/**
 * Minimal safety-talk handlers — return empty collections.
 * The safety-talk module isn't seeded in the demo; consumers just need
 * a valid shape so they don't crash on `.map()` of undefined.
 */

const byWorkerHandler = http.get("*/api/safety-talks/by-worker/:workerId", () => {
	return HttpResponse.json({ safetyTalks: [] })
})

const listHandler = http.get("*/api/safety-talks", () => {
	return HttpResponse.json({ safetyTalks: [], total: 0, pages: 0 })
})

const tableHandler = http.get("*/api/safety-talks/table", () => {
	return HttpResponse.json({ safetyTalks: [], total: 0, pages: 0 })
})

const contractorHandler = http.get("*/api/safety-talks/contractor", () => {
	return HttpResponse.json({ safetyTalks: [], total: 0, pages: 0 })
})

// ORDER MATTERS: specific routes BEFORE catchall /api/safety-talks
export const safetyTalkHandlers = [
	byWorkerHandler,
	tableHandler,
	contractorHandler,
	listHandler,
]
