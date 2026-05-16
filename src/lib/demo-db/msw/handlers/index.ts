import { companyHandlers } from "./company"
import { dashboardHandlers } from "./dashboard"
import { equipmentHandlers } from "./equipment"
import { fallbackHandlers } from "./_fallback"
import { locationHandlers } from "./location"
import { userHandlers } from "./user"
import { workBookHandlers } from "./work-book"
import { workOrderHandlers } from "./work-order"

/**
 * Order matters: specific handlers FIRST, fallback LAST.
 * Per-module handlers (work-orders, work-permits, etc.) are added alongside
 * their PGlite-backed implementations in their own iteration.
 */
export const handlers = [
	...workOrderHandlers,
	...workBookHandlers,
	...userHandlers,
	...companyHandlers,
	...equipmentHandlers,
	...locationHandlers,
	...dashboardHandlers,
	...fallbackHandlers,
]
