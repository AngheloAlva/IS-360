import type { WorkEquipment } from "@/project/equipment/hooks/use-equipments"
import type { UnifiedEquipmentNode, UnifiedLocationNode, UnifiedTreeNode } from "@/project/equipment/types/unified-tree"
import type { WorkLocation } from "@/project/location/hooks/use-locations"

const MAX_EQUIPMENT_DEPTH = 5

function buildEquipmentNode(
	eq: WorkEquipment,
	equipByParent: Map<string, WorkEquipment[]>,
	inheritedLocationId: string,
	depth: number
): UnifiedEquipmentNode {
	const children: UnifiedEquipmentNode[] =
		depth >= MAX_EQUIPMENT_DEPTH
			? []
			: (equipByParent.get(eq.id) ?? [])
					.sort((a, b) => a.name.localeCompare(b.name))
					.map((child) => buildEquipmentNode(child, equipByParent, inheritedLocationId, depth + 1))

	return {
		kind: "equipment",
		data: eq,
		children,
		inheritedLocationId,
		hasLocationDifference: eq.locationId !== inheritedLocationId,
	}
}

function buildLocationNode(
	loc: WorkLocation,
	childrenByParent: Map<string | null, WorkLocation[]>,
	rootEquipByLocation: Map<string, WorkEquipment[]>,
	equipByParent: Map<string, WorkEquipment[]>
): UnifiedLocationNode {
	const childLocations = (childrenByParent.get(loc.id) ?? [])
		.sort((a, b) => a.name.localeCompare(b.name))
		.map((child) => buildLocationNode(child, childrenByParent, rootEquipByLocation, equipByParent))

	const rootEquipment = (rootEquipByLocation.get(loc.id) ?? [])
		.sort((a, b) => a.name.localeCompare(b.name))
		.map((eq) => buildEquipmentNode(eq, equipByParent, loc.id, 0))

	return {
		kind: "location",
		data: loc,
		childLocations,
		rootEquipment,
		hasEquipment: loc.equipmentCount > 0,
		isSentinel: loc.name === "Sin ubicación" && loc.parentId === null,
	}
}

interface BuildUnifiedTreeParams {
	locations: WorkLocation[]
	equipmentMap: Map<string, WorkEquipment>
}

export function buildUnifiedTree({ locations, equipmentMap }: BuildUnifiedTreeParams): UnifiedTreeNode[] {
	// Index locations by parent
	const childrenByParent = new Map<string | null, WorkLocation[]>()
	for (const loc of locations) {
		const key = loc.parentId
		if (!childrenByParent.has(key)) childrenByParent.set(key, [])
		childrenByParent.get(key)!.push(loc)
	}

	// Root equipment (parentId === null) is placed under its locationId; sub-equipment is
	// placed under its parentId regardless of its own locationId.
	const rootEquipByLocation = new Map<string, WorkEquipment[]>()
	const equipByParent = new Map<string, WorkEquipment[]>()

	for (const eq of equipmentMap.values()) {
		if (eq.parentId === null) {
			if (!rootEquipByLocation.has(eq.locationId)) rootEquipByLocation.set(eq.locationId, [])
			rootEquipByLocation.get(eq.locationId)!.push(eq)
		} else {
			if (!equipByParent.has(eq.parentId)) equipByParent.set(eq.parentId, [])
			equipByParent.get(eq.parentId)!.push(eq)
		}
	}

	// Build from root locations (parentId === null), sorted by name
	const rootLocations = (childrenByParent.get(null) ?? []).sort((a, b) => a.name.localeCompare(b.name))
	return rootLocations.map((loc) => buildLocationNode(loc, childrenByParent, rootEquipByLocation, equipByParent))
}
