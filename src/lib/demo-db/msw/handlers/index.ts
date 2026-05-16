import { fallbackHandlers } from "./_fallback"
import { workOrderHandlers } from "./work-order"

/**
 * Order matters: specific handlers FIRST, fallback LAST.
 * Per-module handlers (work-orders, work-permits, etc.) are added alongside
 * their PGlite-backed implementations in their own iteration.
 */
export const handlers = [...workOrderHandlers, ...fallbackHandlers]
