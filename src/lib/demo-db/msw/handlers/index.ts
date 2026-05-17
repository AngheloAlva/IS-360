import { companyHandlers } from "./company"
import { dashboardHandlers } from "./dashboard"
import { documentHandlers } from "./document"
import { equipmentHandlers } from "./equipment"
import { activityLogHandlers } from "./activity-log"
import { fallbackHandlers } from "./_fallback"
import { laborControlHandlers } from "./labor-control"
import { locationHandlers } from "./location"
import { maintenancePlanHandlers } from "./maintenance-plan"
import { safetyTalkHandlers } from "./safety-talk"
import { startupFolderHandlers } from "./startup-folder"
import { supportHandlers } from "./support"
import { userHandlers } from "./user"
import { workBookHandlers } from "./work-book"
import { workOrderHandlers } from "./work-order"
import { workPermitHandlers } from "./work-permit"
import { workRequestHandlers } from "./work-request"

/**
 * Order matters: specific handlers FIRST, fallback LAST.
 * Per-module handlers (work-orders, work-permits, etc.) are added alongside
 * their PGlite-backed implementations in their own iteration.
 */
export const handlers = [
	...workOrderHandlers,
	...workPermitHandlers,
	...workRequestHandlers,
	...workBookHandlers,
	...userHandlers,
	...companyHandlers,
	...equipmentHandlers,
	...locationHandlers,
	...maintenancePlanHandlers,
	...safetyTalkHandlers,
	...startupFolderHandlers,
	...supportHandlers,
	...laborControlHandlers,
	...activityLogHandlers,
	...documentHandlers,
	...dashboardHandlers,
	...fallbackHandlers,
]
