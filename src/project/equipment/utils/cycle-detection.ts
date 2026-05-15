import type { WorkEquipment } from "@/project/equipment/hooks/use-equipments"

export type CycleDetectionMap = Map<string, Pick<WorkEquipment, "id" | "parentId">>

export function isDescendantOf(
	draggedId: string,
	targetId: string,
	equipmentMap: CycleDetectionMap
): boolean {
	if (!equipmentMap.has(targetId)) return false

	let currentId: string | null = targetId
	let iterations = 0

	while (currentId !== null && iterations < 100) {
		if (currentId === draggedId) return true

		const current = equipmentMap.get(currentId)
		if (!current) return false

		currentId = current.parentId
		iterations++
	}

	return false
}
