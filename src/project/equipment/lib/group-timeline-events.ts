import {
	TIMELINE_EVENT_TYPES,
	type EquipmentTimelineEvent,
} from "@/project/equipment/types/equipment-timeline"
import type { WORK_ORDER_TYPE } from "@/generated/prisma/enums"

// ─── Filter kinds ────────────────────────────────────────────────────────────

/** Filter chip identifiers for the timeline filter bar */
export const FILTER_KINDS = {
	ST: "ST",
	CORRECTIVE: "CORRECTIVE",
	PREVENTIVE: "PREVENTIVE",
	PREDICTIVE: "PREDICTIVE",
	PROACTIVE: "PROACTIVE",
} as const

export type FilterKind = (typeof FILTER_KINDS)[keyof typeof FILTER_KINDS]

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Maps WORK_ORDER_TYPE to FilterKind */
const OT_TYPE_TO_FILTER: Record<WORK_ORDER_TYPE, FilterKind> = {
	CORRECTIVE: FILTER_KINDS.CORRECTIVE,
	PREVENTIVE: FILTER_KINDS.PREVENTIVE,
	PREDICTIVE: FILTER_KINDS.PREDICTIVE,
	PROACTIVE: FILTER_KINDS.PROACTIVE,
}

// ─── filterTimelineEvents ────────────────────────────────────────────────────

/**
 * Filters a flat event list by active filter chip set.
 * An empty `hiddenFilters` set means "show all" (no filtering).
 * A non-empty set means "hide these types".
 */
export function filterTimelineEvents(
	events: EquipmentTimelineEvent[],
	hiddenFilters: Set<FilterKind>
): EquipmentTimelineEvent[] {
	if (hiddenFilters.size === 0) return events

	return events.filter((event) => {
		if (event.type === TIMELINE_EVENT_TYPES.WORK_REQUEST) {
			return !hiddenFilters.has(FILTER_KINDS.ST)
		}
		// WorkOrder — map type to filter kind
		const filterKind = OT_TYPE_TO_FILTER[event.workOrderType]
		return !hiddenFilters.has(filterKind)
	})
}
