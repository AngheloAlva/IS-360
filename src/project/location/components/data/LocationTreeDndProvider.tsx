"use client"

import { createContext, useCallback, useContext, useId, useState } from "react"
import {
	DndContext,
	MouseSensor,
	TouchSensor,
	closestCenter,
	useSensor,
	useSensors,
	type DragEndEvent,
	type DragOverEvent,
	type DragStartEvent,
} from "@dnd-kit/core"
import { toast } from "sonner"

import { isDescendantOf, type LocationMap } from "@/project/location/components/data/_helpers/is-descendant-of"
import { useMoveLocation } from "@/project/location/hooks/use-move-location"
import { useReassignEquipmentLocation } from "@/project/equipment/hooks/use-reassign-equipment-location"
import type { WorkLocation } from "@/project/location/hooks/use-locations"

interface DragData {
	type: "location" | "equipment"
	id: string
	parentId: string | null
}

interface LocationTreeDndContextValue {
	activeId: string | null
	overId: string | null
}

const LocationTreeDndContext = createContext<LocationTreeDndContextValue>({
	activeId: null,
	overId: null,
})

export function useLocationTreeDnd() {
	return useContext(LocationTreeDndContext)
}

interface LocationTreeDndProviderProps {
	children: React.ReactNode
	locations: WorkLocation[]
}

export function LocationTreeDndProvider({ children, locations }: LocationTreeDndProviderProps) {
	const dndContextId = useId()
	const moveLocation = useMoveLocation()
	const reassignEquipment = useReassignEquipmentLocation()

	const [activeId, setActiveId] = useState<string | null>(null)
	const [overId, setOverId] = useState<string | null>(null)

	const locationMap: LocationMap = new Map(
		locations.map((l) => [l.id, { id: l.id, parentId: l.parentId }])
	)

	const sensors = useSensors(
		useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
		useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
	)

	const handleDragStart = useCallback((event: DragStartEvent) => {
		const data = event.active.data.current as DragData | undefined
		if (!data) return
		setActiveId(data.id)
		setOverId(null)
	}, [])

	const handleDragOver = useCallback((event: DragOverEvent) => {
		const { over, active } = event
		if (!over || !active) {
			setOverId(null)
			return
		}

		const draggedId = active.id as string
		const targetId = over.id as string
		const dragData = active.data.current as DragData | undefined

		if (dragData?.type !== "location") {
			setOverId(targetId)
			return
		}

		if (draggedId === targetId) {
			setOverId(null)
			return
		}

		const invalid = isDescendantOf(draggedId, targetId, locationMap)
		setOverId(invalid ? null : targetId)
	}, [locationMap])

	const handleDragEnd = useCallback(
		(event: DragEndEvent) => {
			const { active, over } = event

			setActiveId(null)
			setOverId(null)

			if (!over) return

			const dragData = active.data.current as DragData | undefined
			if (!dragData) return

			const draggedId = active.id as string
			const targetId = over.id as string

			if (draggedId === targetId) return

			if (dragData.type === "location") {
				const invalid = isDescendantOf(draggedId, targetId, locationMap)
				if (invalid) {
					toast.warning("No se puede mover: generaría un ciclo en la jerarquía")
					return
				}

				const current = locationMap.get(draggedId)
				if (current?.parentId === targetId) return

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

			if (dragData.type === "equipment") {
				reassignEquipment.mutate(
					{ equipmentId: draggedId, locationId: targetId },
					{
						onSuccess: (result) => {
							if (result && !result.ok) {
								toast.error(result.message ?? "Error al reasignar ubicación")
							}
						},
					}
				)
			}
		},
		[locationMap, moveLocation, reassignEquipment]
	)

	return (
		<LocationTreeDndContext.Provider value={{ activeId, overId }}>
			<DndContext
				id={dndContextId}
				sensors={sensors}
				collisionDetection={closestCenter}
				onDragStart={handleDragStart}
				onDragOver={handleDragOver}
				onDragEnd={handleDragEnd}
			>
				{children}
			</DndContext>
		</LocationTreeDndContext.Provider>
	)
}
