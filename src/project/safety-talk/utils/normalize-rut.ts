/**
 * Normalizes a Chilean RUT by removing dots, dashes, and spaces,
 * then uppercasing the result.
 *
 * Examples:
 * - "13.000.075-4" → "130000754"
 * - "13000075-4"   → "130000754"
 * - "13000075-K"   → "13000075K"
 */
export function normalizeRut(rut: string | null | undefined): string {
	if (!rut) return ""
	return rut.replace(/[\.\-\s]/g, "").toUpperCase()
}
