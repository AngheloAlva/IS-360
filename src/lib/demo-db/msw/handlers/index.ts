import { fallbackHandlers } from "./_fallback"

/**
 * Order matters: specific handlers FIRST, fallback LAST.
 * Per-module handlers (work-orders, work-permits, etc.) will be added in
 * later iterations alongside their PGlite-backed implementations.
 */
export const handlers = [...fallbackHandlers]
