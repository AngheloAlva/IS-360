export function normalizeLocation(raw: string | null | undefined): string[] {
	if (!raw) return []
	return raw
		.split("\\")
		.map((s) => s.replace(/\s+/g, " ").trim())
		.filter((s) => s.length > 0)
}
