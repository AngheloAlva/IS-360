import { addDays, addMonths, addWeeks, addYears, getDaysInMonth } from "date-fns"

import { PLAN_FREQUENCY } from "@/generated/prisma/enums"

/**
 * Calculates the next scheduled date for a maintenance plan task,
 * preserving the original day of month to prevent date drift.
 *
 * Without `originalDayOfMonth`, `addMonths` clamps dates to the
 * last day of shorter months (e.g. Jan 31 → Feb 28), and subsequent
 * calculations never recover the original day (Mar 28, Apr 28, ...).
 *
 * With `originalDayOfMonth`, the function always attempts to restore
 * the intended day, clamping only when the target month is shorter.
 */
export function calculateNextDate(
	currentDate: Date,
	frequency: PLAN_FREQUENCY,
	originalDayOfMonth?: number | null,
): Date {
	let next: Date

	switch (frequency) {
		case PLAN_FREQUENCY.DAILY:
			return addDays(currentDate, 1)
		case PLAN_FREQUENCY.WEEKLY:
			return addWeeks(currentDate, 1)
		case PLAN_FREQUENCY.MONTHLY:
			next = addMonths(currentDate, 1)
			break
		case PLAN_FREQUENCY.BIMONTHLY:
			next = addMonths(currentDate, 2)
			break
		case PLAN_FREQUENCY.QUARTERLY:
			next = addMonths(currentDate, 3)
			break
		case PLAN_FREQUENCY.FOURMONTHLY:
			next = addMonths(currentDate, 4)
			break
		case PLAN_FREQUENCY.BIANNUAL:
			next = addMonths(currentDate, 6)
			break
		case PLAN_FREQUENCY.YEARLY:
			next = addYears(currentDate, 1)
			break
		default:
			next = addMonths(currentDate, 1)
			break
	}

	if (originalDayOfMonth && originalDayOfMonth > next.getDate()) {
		const lastDay = getDaysInMonth(next)
		next.setDate(Math.min(originalDayOfMonth, lastDay))
	}

	return next
}
