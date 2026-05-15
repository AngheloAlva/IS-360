import type { WorkLocation } from "@/project/location/hooks/use-locations"

export type LocationMap = Map<string, Pick<WorkLocation, "id" | "parentId">>

export function isDescendantOf(
	draggedId: string,
	targetId: string,
	locationMap: LocationMap
): boolean {
	if (!locationMap.has(targetId)) return false

	let currentId: string | null = targetId
	let iterations = 0

	while (currentId !== null && iterations < 200) {
		if (currentId === draggedId) return true

		const current = locationMap.get(currentId)
		if (!current) return false

		currentId = current.parentId
		iterations++
	}

	return false
}
