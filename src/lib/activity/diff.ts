interface ActivityDiff<T> {
	changesBefore: Partial<T> | null
	changesAfter: Partial<T> | null
}

interface CreateDiffOptions<T> {
	ignore?: (keyof T)[]
}

export function createDiff<T extends Record<string, unknown>>(
	before: T | null | undefined,
	after: T | null | undefined,
	options?: CreateDiffOptions<T>
): ActivityDiff<T> {
	const ignored = new Set<keyof T>(options?.ignore ?? [])

	if (before == null && after == null) {
		return { changesBefore: null, changesAfter: null }
	}

	if (before == null) {
		const changesAfter = Object.fromEntries(
			Object.entries(after!).filter(([k]) => !ignored.has(k as keyof T))
		) as Partial<T>
		return { changesBefore: null, changesAfter }
	}

	if (after == null) {
		const changesBefore = Object.fromEntries(
			Object.entries(before).filter(([k]) => !ignored.has(k as keyof T))
		) as Partial<T>
		return { changesBefore, changesAfter: null }
	}

	const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]) as Set<string>
	const diffBefore: Partial<T> = {}
	const diffAfter: Partial<T> = {}
	let hasDiff = false

	for (const key of allKeys) {
		if (ignored.has(key as keyof T)) continue
		const bVal = before[key]
		const aVal = after[key]
		if (JSON.stringify(bVal) !== JSON.stringify(aVal)) {
			;(diffBefore as Record<string, unknown>)[key] = bVal
			;(diffAfter as Record<string, unknown>)[key] = aVal
			hasDiff = true
		}
	}

	if (!hasDiff) {
		return { changesBefore: null, changesAfter: null }
	}

	return { changesBefore: diffBefore, changesAfter: diffAfter }
}
