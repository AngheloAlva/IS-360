"use client"

import { useRef, useState } from "react"
import { useDraggable, useDroppable } from "@dnd-kit/core"
import { ChevronDownIcon, ChevronRightIcon, GripVerticalIcon, PlusIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/shared/components/ui/alert-dialog"
import { Input } from "@/shared/components/ui/input"
import { useRenameLocation } from "@/project/location/hooks/use-rename-location"
import { useDeleteLocation } from "@/project/location/hooks/use-delete-location"
import type { WorkLocation } from "@/project/location/hooks/use-locations"

interface LocationDraggableNodeProps {
	location: WorkLocation
	depth: number
	isExpanded: boolean
	hasChildren: boolean
	onToggleExpand: (id: string) => void
	onCreateChild: (parentId: string) => void
	canCreate: boolean
	canDelete: boolean
	isSentinel: boolean
}

export function LocationDraggableNode({
	location,
	depth,
	isExpanded,
	hasChildren,
	onToggleExpand,
	onCreateChild,
	canCreate,
	canDelete,
	isSentinel,
}: LocationDraggableNodeProps) {
	const [isEditing, setIsEditing] = useState(false)
	const [editValue, setEditValue] = useState(location.name)
	const inputRef = useRef<HTMLInputElement>(null)

	const renameLocation = useRenameLocation()
	const deleteLocation = useDeleteLocation()

	const dragData = { type: "location" as const, id: location.id, parentId: location.parentId }
	const dropData = { type: "location" as const, id: location.id, hasChildren }

	const {
		attributes,
		listeners,
		setNodeRef: setDragRef,
		isDragging,
	} = useDraggable({
		id: location.id,
		data: dragData,
		disabled: isSentinel,
	})

	const { setNodeRef: setDropRef, isOver } = useDroppable({
		id: location.id,
		data: dropData,
	})

	const setRef = (node: HTMLDivElement | null) => {
		setDragRef(node as HTMLElement | null)
		setDropRef(node)
	}

	const handleDoubleClick = () => {
		if (isSentinel) return
		setIsEditing(true)
		setEditValue(location.name)
		setTimeout(() => inputRef.current?.select(), 0)
	}

	const commitRename = () => {
		const trimmed = editValue.trim()
		if (!trimmed || trimmed === location.name) {
			setIsEditing(false)
			return
		}
		renameLocation.mutate(
			{ id: location.id, name: trimmed },
			{
				onSuccess: (result) => {
					if (!result?.ok) {
						toast.error(result?.message ?? "Error al renombrar")
					}
					setIsEditing(false)
				},
				onError: () => {
					setIsEditing(false)
				},
			}
		)
	}

	const handleConfirmDelete = () => {
		deleteLocation.mutate(
			{ id: location.id },
			{
				onSuccess: (result) => {
					if (!result?.ok) {
						toast.error(result?.message ?? "Error al eliminar")
					}
				},
			}
		)
	}

	return (
		<div
			ref={setRef}
			className={cn(
				"group flex items-center gap-1 rounded-md px-2 py-1.5 text-sm transition-colors",
				"hover:bg-muted/40",
				isDragging && "opacity-50",
				isOver && !isDragging && "bg-primary/10 ring-1 ring-inset ring-primary/50"
			)}
			style={{ paddingLeft: `${depth * 16 + 8}px` }}
		>
			<Button
				variant="ghost"
				size="icon-sm"
				className={cn(
					"size-5 shrink-0",
					isSentinel ? "cursor-default opacity-0 pointer-events-none" : "cursor-grab opacity-40 hover:bg-transparent hover:opacity-100 active:cursor-grabbing"
				)}
				{...attributes}
				{...listeners}
				tabIndex={-1}
			>
				<GripVerticalIcon className="size-3.5" />
			</Button>

			<Button
				variant="ghost"
				size="icon-sm"
				className={cn("size-5 shrink-0", !hasChildren && "invisible")}
				onClick={() => onToggleExpand(location.id)}
				tabIndex={-1}
			>
				{isExpanded ? (
					<ChevronDownIcon className="size-3.5" />
				) : (
					<ChevronRightIcon className="size-3.5" />
				)}
			</Button>

			{isEditing ? (
				<Input
					ref={inputRef}
					value={editValue}
					onChange={(e) => setEditValue(e.target.value)}
					onBlur={commitRename}
					onKeyDown={(e) => {
						if (e.key === "Enter") commitRename()
						if (e.key === "Escape") setIsEditing(false)
					}}
					className="h-6 px-1 py-0 text-sm"
					autoFocus
				/>
			) : (
				<span
					className={cn(
						"flex-1 truncate",
						isSentinel ? "text-muted-foreground italic" : "cursor-pointer"
					)}
					onDoubleClick={handleDoubleClick}
				>
					{location.name}
				</span>
			)}

			{location.equipmentCount > 0 && (
				<Badge variant="secondary" className="ml-auto shrink-0 text-xs">
					{location.equipmentCount}
				</Badge>
			)}

			<div className={cn("ml-1 flex shrink-0 items-center gap-0.5 opacity-0 group-hover:opacity-100")}>
				{canCreate && (
					<Button
						variant="ghost"
						size="icon-sm"
						className="size-6"
						onClick={() => onCreateChild(location.id)}
						title="Crear ubicación hija"
					>
						<PlusIcon className="size-3.5" />
					</Button>
				)}

				{canDelete && !isSentinel && (
					<AlertDialog>
						<AlertDialogTrigger asChild>
							<Button
								variant="ghost"
								size="icon-sm"
								className="size-6 text-destructive hover:text-destructive"
								title="Eliminar ubicación"
							>
								<Trash2Icon className="size-3.5" />
							</Button>
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>Eliminar ubicación</AlertDialogTitle>
								<AlertDialogDescription>
									¿Eliminar <strong>{location.name}</strong>? Esta acción no se puede deshacer.
									La ubicación debe no tener hijos ni equipos asignados.
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel>Cancelar</AlertDialogCancel>
								<AlertDialogAction
									onClick={handleConfirmDelete}
									className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
								>
									Eliminar
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				)}
			</div>
		</div>
	)
}
