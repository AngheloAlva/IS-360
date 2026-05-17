import { http, HttpResponse } from "msw"

/**
 * The demo does not persist activity logs: src/lib/activity/log.ts is a console
 * no-op and the schema has no activity_log table. The page just renders an
 * empty filtered table, which is consistent for a demo.
 */
const listHandler = http.get("*/api/activity-logs", () => {
	return HttpResponse.json({ logs: [], total: 0, pages: 0 })
})

export const activityLogHandlers = [listHandler]
