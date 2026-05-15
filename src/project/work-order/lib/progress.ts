/**
 * Computes work order progress from an array of completed milestone weights.
 *
 * Rules (SPEC-004):
 * - raw sum >= 99.99 → returns exactly 100 (float drift normalization)
 * - otherwise → rounds to 2 decimal places
 * - result is always clamped to 100 (defensive against weight data anomalies)
 */
export function computeProgress(weights: number[]): number {
	const raw = weights.reduce((sum, w) => sum + w, 0)
	if (raw >= 99.99) return 100
	return Math.min(100, Math.round(raw * 100) / 100)
}
