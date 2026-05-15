import { isDescendantOf as isEquipmentDescendantOf, type CycleDetectionMap } from "@/project/equipment/utils/cycle-detection"
import { isDescendantOf as isLocationDescendantOf, type LocationMap } from "@/project/location/components/data/_helpers/is-descendant-of"

export function canDropLocationOnLocation(
	activeId: string,
	targetId: string,
	locationMap: LocationMap
): boolean {
	if (activeId === targetId) return false
	return !isLocationDescendantOf(activeId, targetId, locationMap)
}

export function canDropEquipmentOnEquipment(
	activeId: string,
	targetId: string,
	equipmentMap: CycleDetectionMap
): boolean {
	if (activeId === targetId) return false
	return !isEquipmentDescendantOf(activeId, targetId, equipmentMap)
}
