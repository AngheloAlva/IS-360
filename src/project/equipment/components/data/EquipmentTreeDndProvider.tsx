"use client"

import { createContext, useCallback, useContext, useId, useMemo, useRef, useState } from "react"
import {
	DndContext,
	DragOverlay,
	MouseSensor,
	TouchSensor,
	useDraggable,
	useDroppable,
	useSensor,
	useSensors,
	type DragEndEvent,
	type DragOverEvent,
	type DragStartEvent,
} from "@dnd-kit/core"
import { type ExpandedState } from "@tanstack/react-table"
import { toast } from "sonner"

import { GripVerticalIcon } from "lucide-react"

import { isDescendantOf, type CycleDetectionMap } from "@/project/equipment/utils/cycle-detection"
import { useMoveEquipment } from "@/project/equipment/hooks/use-move-equipment"
import type { WorkEquipment } from "@/project/equipment/hooks/use-equipments"
import { Button } from "@/shared/components/ui/button"
import { cn } from "@/lib/utils"

export type { CycleDetectionMap }

interface DragData {
	id: string
	parentId: string | null
	name: string
	tag: string
}

interface DropData {
	id: string
	hasChildren: boolean
}

interface EquipmentTreeDndContextValue {
	activeId: string | null
	overId: string | null
	isInvalidDrop: boolean
}

const EquipmentTreeDndContext = createContext<EquipmentTreeDndContextValue>({
	activeId: null,
	overId: null,
	isInvalidDrop: false,
})

function useEquipmentTreeDnd() {
	return useContext(EquipmentTreeDndContext)
}

interface EquipmentTreeDndProviderProps {
	children: React.ReactNode
	equipmentMap: CycleDetectionMap
	expandedRows: ExpandedState
	onExpandedChange: (updater: ExpandedState | ((prev: ExpandedState) => ExpandedState)) => void
}

export function EquipmentTreeDndProvider({
	children,
	equipmentMap,
	expandedRows,
	onExpandedChange,
}: EquipmentTreeDndProviderProps) {
	const dndContextId = useId()
	const moveEquipment = useMoveEquipment()

	const [activeId, setActiveId] = useState<string | null>(null)
	const [activeDragData, setActiveDragData] = useState<DragData | null>(null)
	const [overId, setOverId] = useState<string | null>(null)
	const [isInvalidDrop, setIsInvalidDrop] = useState(false)

	const wasExpandedRef = useRef<boolean>(false)
	const autoExpandTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
	const lastHoveredIdRef = useRef<string | null>(null)
	const cycleCheckCacheRef = useRef<{ draggedId: string; targetId: string; result: boolean } | null>(null)

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

	const getIsExpanded = useCallback(
		(id: string): boolean => {
			if (typeof expandedRows !== "object" || expandedRows === null) return false
			return Boolean((expandedRows as Record<string, boolean>)[id])
		},
		[expandedRows]
	)

	const handleDragStart = useCallback(
		(event: DragStartEvent) => {
			const data = event.active.data.current as DragData | undefined
			if (!data) return

			setActiveId(data.id)
			setActiveDragData(data)
			setOverId(null)
			setIsInvalidDrop(false)
			cycleCheckCacheRef.current = null

			const isExpanded = getIsExpanded(data.id)
			wasExpandedRef.current = isExpanded

			if (isExpanded) {
				onExpandedChange((prev) => {
					const next = { ...(prev as Record<string, boolean>) }
					delete next[data.id]
					return next
				})
			}
		},
		[getIsExpanded, onExpandedChange]
	)

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

			if (targetId === "root-drop-zone") {
				clearAutoExpandTimer()
				setOverId("root-drop-zone")
				setIsInvalidDrop(false)
				return
			}

			if (draggedId === targetId) {
				clearAutoExpandTimer()
				setOverId(null)
				setIsInvalidDrop(false)
				return
			}

			let invalid: boolean
			const cached = cycleCheckCacheRef.current
			if (cached && cached.draggedId === draggedId && cached.targetId === targetId) {
				invalid = cached.result
			} else {
				invalid = isDescendantOf(draggedId, targetId, equipmentMap)
				cycleCheckCacheRef.current = { draggedId, targetId, result: invalid }
			}
			setIsInvalidDrop(invalid)
			setOverId(invalid ? null : targetId)

			if (!invalid && targetId !== lastHoveredIdRef.current) {
				clearAutoExpandTimer()
				lastHoveredIdRef.current = targetId

				const dropData = over.data.current as DropData | undefined
				const targetHasChildren = dropData?.hasChildren ?? false
				const isAlreadyExpanded = getIsExpanded(targetId)

				if (targetHasChildren && !isAlreadyExpanded) {
					autoExpandTimerRef.current = setTimeout(() => {
						onExpandedChange((prev) => ({
							...(prev as Record<string, boolean>),
							[targetId]: true,
						}))
					}, 500)
				}
			}
		},
		[equipmentMap, getIsExpanded, onExpandedChange, clearAutoExpandTimer]
	)

	const handleDragEnd = useCallback(
		(event: DragEndEvent) => {
			const { active, over } = event

			clearAutoExpandTimer()

			const draggedId = active.id as string
			const dragData = active.data.current as DragData | undefined

			setActiveId(null)
			setActiveDragData(null)
			setOverId(null)
			setIsInvalidDrop(false)

			if (!over) {
				if (wasExpandedRef.current && draggedId) {
					onExpandedChange((prev) => ({
						...(prev as Record<string, boolean>),
						[draggedId]: true,
					}))
				}
				wasExpandedRef.current = false
				return
			}

			const targetId = over.id as string

			if (targetId === draggedId) {
				if (wasExpandedRef.current) {
					onExpandedChange((prev) => ({
						...(prev as Record<string, boolean>),
						[draggedId]: true,
					}))
				}
				wasExpandedRef.current = false
				return
			}

			const isRootDrop = targetId === "root-drop-zone"
			const invalid = !isRootDrop && isDescendantOf(draggedId, targetId, equipmentMap)

			if (invalid) {
				toast.warning("No se puede mover: generaría un ciclo en la jerarquía")
				if (wasExpandedRef.current) {
					onExpandedChange((prev) => ({
						...(prev as Record<string, boolean>),
						[draggedId]: true,
					}))
				}
				wasExpandedRef.current = false
				return
			}

			const newParentId = isRootDrop ? null : targetId

			if (dragData?.parentId === newParentId) {
				if (wasExpandedRef.current) {
					onExpandedChange((prev) => ({
						...(prev as Record<string, boolean>),
						[draggedId]: true,
					}))
				}
				wasExpandedRef.current = false
				return
			}

			const wasExpanded = wasExpandedRef.current
			wasExpandedRef.current = false

			moveEquipment.mutate(
				{ id: draggedId, parentId: newParentId },
				{
					onSuccess: () => {
						if (wasExpanded && newParentId !== null) {
							onExpandedChange((prev) => ({
								...(prev as Record<string, boolean>),
								[newParentId]: true,
							}))
						}
					},
				}
			)
		},
		[equipmentMap, clearAutoExpandTimer, onExpandedChange, moveEquipment]
	)

	return (
		<EquipmentTreeDndContext.Provider value={{ activeId, overId, isInvalidDrop }}>
			<DndContext
				id={dndContextId}
				sensors={sensors}
				onDragStart={handleDragStart}
				onDragOver={handleDragOver}
				onDragEnd={handleDragEnd}
			>
				{children}
				<DragOverlay dropAnimation={null}>
					{activeDragData && (
						<div className="bg-background border-border flex items-center gap-2 rounded-md border px-3 py-2 text-sm shadow-lg">
							<span className="text-muted-foreground font-mono text-xs">{activeDragData.tag}</span>
							<span className="font-medium">{activeDragData.name}</span>
						</div>
					)}
				</DragOverlay>
			</DndContext>
		</EquipmentTreeDndContext.Provider>
	)
}

type DragHandleContextValue = {
	attributes: ReturnType<typeof useDraggable>["attributes"]
	listeners: ReturnType<typeof useDraggable>["listeners"]
} | null

const DragHandleContext = createContext<DragHandleContextValue>(null)

interface EquipmentDraggableRowProps {
	id: string
	parentId: string | null
	name: string
	tag: string
	hasChildren: boolean
	children: React.ReactNode
	className?: string
}

export function EquipmentDraggableRow({
	id,
	parentId,
	name,
	tag,
	hasChildren,
	children,
	className,
}: EquipmentDraggableRowProps) {
	const { activeId, overId, isInvalidDrop } = useEquipmentTreeDnd()

	const dragData: DragData = { id, parentId, name, tag }
	const dropData: DropData = { id, hasChildren }

	const {
		attributes,
		listeners,
		setNodeRef: setDragRef,
	} = useDraggable({
		id,
		data: dragData,
	})

	const { setNodeRef: setDropRef, isOver } = useDroppable({
		id,
		data: dropData,
	})

	const isDropTarget = overId === id
	const isCurrentlyDragging = activeId === id
	const isOverInvalid = isOver && isInvalidDrop

	const setRef = (node: HTMLTableRowElement | null) => {
		setDragRef(node as HTMLElement | null)
		setDropRef(node)
	}

	const handleCtx = useMemo(() => ({ attributes, listeners }), [attributes, listeners])

	return (
		<DragHandleContext.Provider value={handleCtx}>
			<tr
				ref={setRef}
				className={cn(
					"hover:bg-muted/40 data-[state=selected]:bg-muted/50 border-border border-b [&:not(:last-child)>td]:border-b",
					isCurrentlyDragging && "opacity-50",
					isDropTarget && !isCurrentlyDragging && "bg-primary/10 ring-1 ring-inset ring-primary/50",
					isOverInvalid && "cursor-not-allowed ring-1 ring-inset ring-destructive/50",
					className
				)}
			>
				{children}
			</tr>
		</DragHandleContext.Provider>
	)
}

export function EquipmentDragHandle({ className }: { className?: string }) {
	const context = useContext(DragHandleContext)

	if (!context) {
		return (
			<Button
				variant="ghost"
				size="icon-sm"
				className={cn("size-7 cursor-move opacity-40", className)}
				disabled
			>
				<GripVerticalIcon className="size-4" />
			</Button>
		)
	}

	return (
		<Button
			variant="ghost"
			size="icon-sm"
			className={cn(
				"size-7 cursor-grab opacity-40 hover:bg-transparent hover:opacity-100 active:cursor-grabbing",
				className
			)}
			{...context.attributes}
			{...context.listeners}
		>
			<GripVerticalIcon className="size-4" />
		</Button>
	)
}

export function RootDropZone() {
	const { setNodeRef } = useDroppable({ id: "root-drop-zone" })
	const { activeId, overId } = useEquipmentTreeDnd()
	const isActive = activeId !== null
	const isOver = overId === "root-drop-zone"

	if (!isActive) return null

	return (
		<div
			ref={setNodeRef}
			className={cn(
				"mb-2 flex h-10 items-center justify-center rounded-md border-2 border-dashed text-xs transition-all duration-150",
				isOver
					? "border-primary bg-primary/10 text-primary"
					: "border-muted-foreground/30 text-muted-foreground"
			)}
		>
			Soltar aquí para mover a raíz
		</div>
	)
}
