"use client"

import {
	createContext,
	useCallback,
	useContext,
	useId,
	useMemo,
	useRef,
	useState,
	type ReactNode,
} from "react"
import {
	DndContext,
	DragOverlay,
	MouseSensor,
	TouchSensor,
	closestCenter,
	useSensor,
	useSensors,
	type CollisionDetection,
	type DragEndEvent,
	type DragOverEvent,
	type DragStartEvent,
} from "@dnd-kit/core"
import { MapPinIcon, WrenchIcon } from "lucide-react"
import { toast } from "sonner"

import {
	canDropEquipmentOnEquipment,
	canDropLocationOnLocation,
} from "@/project/equipment/utils/unified-cycle-detection"
import { useMoveEquipment } from "@/project/equipment/hooks/use-move-equipment"
import { useReassignEquipmentToLocation } from "@/project/equipment/hooks/use-reassign-equipment-to-location"
import { useMoveLocation } from "@/project/location/hooks/use-move-location"
import type { UnifiedDragData, UnifiedDropData } from "@/project/equipment/types/unified-tree"
import type { WorkLocation } from "@/project/location/hooks/use-locations"
import type { CycleDetectionMap } from "@/project/equipment/utils/cycle-detection"
import type { LocationMap } from "@/project/location/components/data/_helpers/is-descendant-of"

interface UnifiedTreeDndContextValue {
	activeId: string | null
	overId: string | null
	isInvalidDrop: boolean
	activeDragData: UnifiedDragData | null
}

const UnifiedTreeDndContext = createContext<UnifiedTreeDndContextValue>({
	activeId: null,
	overId: null,
	isInvalidDrop: false,
	activeDragData: null,
})

export function useUnifiedTreeDnd() {
	return useContext(UnifiedTreeDndContext)
}

interface UnifiedTreeDndProviderProps {
	children: ReactNode
	locations: WorkLocation[]
	equipmentMap: CycleDetectionMap
	expanded: Set<string>
	onAutoExpand?: (id: string) => void
}

function buildCollisionDetection(activeDragType: string | undefined): CollisionDetection {
	return (args) => {
		const compatible = args.droppableContainers.filter((container) => {
			const overType = (container.data.current as UnifiedDropData | undefined)?.type
			if (!activeDragType) return false
			if (activeDragType === "location") return overType === "location"
			// equipment-root and equipment-child can go to location, equipment, or root-equipment-zone
			return overType === "location" || overType === "equipment" || overType === "root-equipment-zone"
		})
		return closestCenter({ ...args, droppableContainers: compatible })
	}
}

export function UnifiedTreeDndProvider({
	children,
	locations,
	equipmentMap,
	expanded,
	onAutoExpand,
}: UnifiedTreeDndProviderProps) {
	const dndContextId = useId()

	const moveLocation = useMoveLocation()
	const moveEquipment = useMoveEquipment()
	const reassignEquipmentToLocation = useReassignEquipmentToLocation()

	const [activeId, setActiveId] = useState<string | null>(null)
	const [activeDragData, setActiveDragData] = useState<UnifiedDragData | null>(null)
	const [overId, setOverId] = useState<string | null>(null)
	const [isInvalidDrop, setIsInvalidDrop] = useState(false)

	const autoExpandTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
	const lastHoveredIdRef = useRef<string | null>(null)
	// Cache last cycle-check result to avoid recomputing on every onDragOver call
	const cycleCheckCacheRef = useRef<{ draggedId: string; targetId: string; result: boolean } | null>(null)

	const locationMap: LocationMap = useMemo(
		() => new Map(locations.map((l) => [l.id, { id: l.id, parentId: l.parentId }])),
		[locations]
	)

	const sensors = useSensors(
		useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
		useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
	)

	const clearAutoExpandTimer = useCallback(() => {
		if (autoExpandTimerRef.current) {
			clearTimeout(autoExpandTimerRef.current)
			autoExpandTimerRef.current = null
		}
		lastHoveredIdRef.current = null
	}, [])

	const handleDragStart = useCallback((event: DragStartEvent) => {
		const data = event.active.data.current as UnifiedDragData | undefined
		if (!data) return

		setActiveId(data.id)
		setActiveDragData(data)
		setOverId(null)
		setIsInvalidDrop(false)
		cycleCheckCacheRef.current = null
	}, [])

	const handleDragOver = useCallback(
		(event: DragOverEvent) => {
			const { over, active } = event

			if (!over || !active) {
				setOverId(null)
				setIsInvalidDrop(false)
				clearAutoExpandTimer()
				return
			}

			const draggedId = active.id as string
			const targetId = over.id as string
			const dragData = active.data.current as UnifiedDragData | undefined
			const dropData = over.data.current as UnifiedDropData | undefined

			if (!dragData || !dropData) {
				setOverId(null)
				setIsInvalidDrop(false)
				clearAutoExpandTimer()
				return
			}

			if (draggedId === targetId) {
				setOverId(null)
				setIsInvalidDrop(false)
				clearAutoExpandTimer()
				return
			}

			let invalid = false

			if (dragData.type === "location" && dropData.type === "location") {
				const cached = cycleCheckCacheRef.current
				if (cached && cached.draggedId === draggedId && cached.targetId === targetId) {
					invalid = cached.result
				} else {
					invalid = !canDropLocationOnLocation(draggedId, targetId, locationMap)
					cycleCheckCacheRef.current = { draggedId, targetId, result: invalid }
				}
			} else if (
				(dragData.type === "equipment-root" || dragData.type === "equipment-child") &&
				dropData.type === "equipment"
			) {
				const cached = cycleCheckCacheRef.current
				if (cached && cached.draggedId === draggedId && cached.targetId === targetId) {
					invalid = cached.result
				} else {
					invalid = !canDropEquipmentOnEquipment(draggedId, targetId, equipmentMap)
					cycleCheckCacheRef.current = { draggedId, targetId, result: invalid }
				}
			}

			setIsInvalidDrop(invalid)
			setOverId(invalid ? null : targetId)

			// Auto-expand on hover: if we're hovering a new, collapsed, expandable target
			if (!invalid && targetId !== lastHoveredIdRef.current) {
				clearAutoExpandTimer()
				lastHoveredIdRef.current = targetId

				const isAlreadyExpanded = expanded.has(targetId)
				const targetIsExpandable =
					(dropData.type === "location") ||
					(dropData.type === "equipment" && dropData.hasChildren)

				if (targetIsExpandable && !isAlreadyExpanded && onAutoExpand) {
					autoExpandTimerRef.current = setTimeout(() => {
						onAutoExpand(targetId)
					}, 500)
				}
			}
		},
		[locationMap, equipmentMap, expanded, onAutoExpand, clearAutoExpandTimer]
	)

	const handleDragEnd = useCallback(
		(event: DragEndEvent) => {
			const { active, over } = event

			clearAutoExpandTimer()

			const dragData = active.data.current as UnifiedDragData | undefined

			setActiveId(null)
			setActiveDragData(null)
			setOverId(null)
			setIsInvalidDrop(false)
			cycleCheckCacheRef.current = null

			if (!over || !dragData) return

			const draggedId = active.id as string
			const targetId = over.id as string
			const dropData = over.data.current as UnifiedDropData | undefined

			if (!dropData) return
			if (draggedId === targetId) return

			// Case: location → location
			if (dragData.type === "location" && dropData.type === "location") {
				if (dropData.isSentinel) return

				if (!canDropLocationOnLocation(draggedId, targetId, locationMap)) {
					toast.error("No se puede mover una ubicación dentro de su propia rama")
					return
				}

				const currentParent = locationMap.get(draggedId)?.parentId
				if (currentParent === targetId) return

				moveLocation.mutate(
					{ id: draggedId, parentId: targetId },
					{
						onSuccess: (result) => {
							if (result && !result.ok) {
								toast.error(result.message ?? "Error al mover la ubicación")
							}
						},
					}
				)
				return
			}

			// equipment → location reassign clears parentId atomically when dragging a child equipment
			if (
				(dragData.type === "equipment-root" || dragData.type === "equipment-child") &&
				dropData.type === "location"
			) {
				if (dragData.locationId === targetId && dragData.type === "equipment-root") return

				reassignEquipmentToLocation.mutate({
					id: draggedId,
					locationId: targetId,
					clearParent: dragData.type === "equipment-child",
				})
				return
			}

			// Case: equipment-root or equipment-child → equipment (re-parent)
			if (
				(dragData.type === "equipment-root" || dragData.type === "equipment-child") &&
				dropData.type === "equipment"
			) {
				if (!canDropEquipmentOnEquipment(draggedId, targetId, equipmentMap)) {
					toast.error("No se puede mover un equipo dentro de su propia jerarquía")
					return
				}

				const currentParentId =
					dragData.type === "equipment-child" ? dragData.parentId : null
				if (currentParentId === targetId) return

				moveEquipment.mutate({ id: draggedId, parentId: targetId })
				return
			}

			// Case: equipment-* → root-equipment-zone (un-parent equipment, keep in same location)
			if (
				(dragData.type === "equipment-root" || dragData.type === "equipment-child") &&
				dropData.type === "root-equipment-zone"
			) {
				if (dragData.type === "equipment-root") return

				moveEquipment.mutate({ id: draggedId, parentId: null })
			}
		},
		[locationMap, equipmentMap, moveLocation, moveEquipment, reassignEquipmentToLocation, clearAutoExpandTimer]
	)

	const activeDragType = activeDragData?.type
	const collisionDetection = useMemo(
		() => buildCollisionDetection(activeDragType),
		[activeDragType]
	)

	return (
		<UnifiedTreeDndContext.Provider value={{ activeId, overId, isInvalidDrop, activeDragData }}>
			<DndContext
				id={dndContextId}
				sensors={sensors}
				collisionDetection={collisionDetection}
				onDragStart={handleDragStart}
				onDragOver={handleDragOver}
				onDragEnd={handleDragEnd}
			>
				{children}
				<DragOverlay dropAnimation={null}>
					{activeDragData && (
						<div className="bg-background border-border flex items-center gap-2 rounded-md border px-3 py-2 text-sm shadow-lg">
							{activeDragData.type === "location" ? (
								<MapPinIcon className="text-muted-foreground size-4 shrink-0" />
							) : (
								<WrenchIcon className="text-muted-foreground size-4 shrink-0" />
							)}
							<span className="font-medium">{activeDragData.name}</span>
							{(activeDragData.type === "equipment-root" ||
								activeDragData.type === "equipment-child") && (
								<span className="text-muted-foreground font-mono text-xs">
									{activeDragData.tag}
								</span>
							)}
						</div>
					)}
				</DragOverlay>
			</DndContext>
		</UnifiedTreeDndContext.Provider>
	)
}
