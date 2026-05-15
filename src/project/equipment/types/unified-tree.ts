import type { CRITICALITY } from "@/generated/prisma/enums"
import type { WorkEquipment } from "@/project/equipment/hooks/use-equipments"
import type { WorkLocation } from "@/project/location/hooks/use-locations"

export interface UnifiedLocationNode {
	kind: "location"
	data: WorkLocation
	childLocations: UnifiedLocationNode[]
	rootEquipment: UnifiedEquipmentNode[]
	hasEquipment: boolean
	isSentinel: boolean
}

export interface UnifiedEquipmentNode {
	kind: "equipment"
	data: WorkEquipment
	children: UnifiedEquipmentNode[]
	inheritedLocationId: string
	hasLocationDifference: boolean
}

export type UnifiedTreeNode = UnifiedLocationNode | UnifiedEquipmentNode

export type UnifiedDragData =
	| { type: "location"; id: string; parentId: string | null; name: string }
	| { type: "equipment-root"; id: string; locationId: string; parentId: null; name: string; tag: string }
	| { type: "equipment-child"; id: string; parentId: string; locationId: string; name: string; tag: string }

export type UnifiedDropData =
	| { type: "location"; id: string; isSentinel: boolean }
	| { type: "equipment"; id: string; hasChildren: boolean; locationId: string }
	| { type: "root-equipment-zone"; locationId: string }

export interface UnifiedTreeFilters {
	search: string
	status?: "operational" | "non-operational"
	criticality?: CRITICALITY
	type?: string
}
