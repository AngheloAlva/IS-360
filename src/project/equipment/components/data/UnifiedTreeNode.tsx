"use client"

import { useState } from "react"
import { useDraggable, useDroppable } from "@dnd-kit/core"
import {
  ChevronDownIcon,
  ChevronRightIcon,
  EditIcon,
  GripVerticalIcon,
  MapPinIcon,
  PlusIcon,
  Trash2Icon,
  WrenchIcon,
} from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
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
import EquipmentDetailsDialog from "@/project/equipment/components/dialogs/EquipmentDetailsDialog"
import EditEquipmentForm from "@/project/equipment/components/forms/EditEquipmentForm"
import CreateEquipmentForm from "@/project/equipment/components/forms/CreateEquipmentForm"
import { useUnifiedTreePermissions } from "@/project/equipment/contexts/unified-tree-permissions-context"
import { useUnifiedTreeSearch } from "@/project/equipment/contexts/unified-tree-search-context"
import { useEquipmentsByLocation } from "@/project/equipment/hooks/use-equipments-by-location"
import { useChildEquipments } from "@/project/equipment/hooks/use-child-equipments"
import { useRenameLocation } from "@/project/location/hooks/use-rename-location"
import { useDeleteLocation } from "@/project/location/hooks/use-delete-location"
import { useCreateLocation } from "@/project/location/hooks/use-create-location"
import type { UnifiedEquipmentNode, UnifiedLocationNode } from "@/project/equipment/types/unified-tree"
import type { WorkEquipment } from "@/project/equipment/hooks/use-equipments"

const MAX_EQUIPMENT_DEPTH = 5

// ---- Equipment Node ----

interface EquipmentNodeProps {
  node: UnifiedEquipmentNode
  depth: number
  expanded: Set<string>
  onToggleExpand: (id: string) => void
  allEquipments: WorkEquipment[]
  // When true, the node renders as a leaf regardless of children (used under sentinel)
  flatLeafMode?: boolean
}

function EquipmentNode({ node, depth, expanded, onToggleExpand, allEquipments, flatLeafMode = false }: EquipmentNodeProps) {
  const perms = useUnifiedTreePermissions()
  const { matchedIds } = useUnifiedTreeSearch()
  const eq = node.data
  const isSearchMatch = matchedIds.size > 0 && matchedIds.has(eq.id)

  const isExpanded = expanded.has(eq.id)
  // Sentinel children are flat leaves — never expand regardless of actual children
  const hasSubEquipment = !flatLeafMode && eq._count.children > 0

  const childQuery = useChildEquipments({
    parentId: isExpanded && hasSubEquipment ? eq.id : null,
    orderBy: "name",
    order: "asc",
  })

  const dragData =
    eq.parentId === null
      ? {
          type: "equipment-root" as const,
          id: eq.id,
          locationId: eq.locationId,
          parentId: null as null,
          name: eq.name,
          tag: eq.tag,
        }
      : {
          type: "equipment-child" as const,
          id: eq.id,
          parentId: eq.parentId,
          locationId: eq.locationId,
          name: eq.name,
          tag: eq.tag,
        }

  const dropData = {
    type: "equipment" as const,
    id: eq.id,
    hasChildren: hasSubEquipment,
    locationId: eq.locationId,
  }

  const {
    attributes,
    listeners,
    setNodeRef: setDragRef,
    isDragging,
  } = useDraggable({
    id: eq.id,
    data: dragData,
    disabled: !perms.canUpdateEquipment,
  })

  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: eq.id,
    data: dropData,
  })

  const setRef = (el: HTMLDivElement | null) => {
    setDragRef(el as HTMLElement | null)
    setDropRef(el)
  }

  const childEquipmentNodes: UnifiedEquipmentNode[] =
    isExpanded && childQuery.data?.equipments
      ? childQuery.data.equipments.map((child) => ({
          kind: "equipment" as const,
          data: child,
          children: [],
          inheritedLocationId: node.inheritedLocationId,
          hasLocationDifference: child.locationId !== node.inheritedLocationId,
        }))
      : []

  return (
    <div>
      <div
        ref={setRef}
        className={cn(
          "group flex items-center gap-1 rounded-md px-2 py-1.5 text-sm transition-colors",
          "hover:bg-muted/40",
          isDragging && "opacity-50",
          isOver && !isDragging && "bg-primary/10 ring-1 ring-inset ring-primary/50",
          isSearchMatch && "bg-yellow-200/30 dark:bg-yellow-300/15"
        )}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        <Button
          variant="ghost"
          size="icon-sm"
          className={cn(
            "size-5 shrink-0",
            perms.canUpdateEquipment
              ? "cursor-grab opacity-40 hover:bg-transparent hover:opacity-100 active:cursor-grabbing"
              : "cursor-default opacity-0 pointer-events-none"
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
          className={cn("size-5 shrink-0", !hasSubEquipment && "invisible")}
          onClick={(e) => {
            e.stopPropagation()
            onToggleExpand(eq.id)
          }}
          tabIndex={-1}
        >
          {isExpanded ? (
            <ChevronDownIcon className="size-3.5" />
          ) : (
            <ChevronRightIcon className="size-3.5" />
          )}
        </Button>

        <EquipmentDetailsDialog equipment={eq}>
          <div className="flex flex-1 min-w-0 cursor-pointer items-center gap-1.5">
            <WrenchIcon className="text-muted-foreground size-3.5 shrink-0" />
            <div className="flex flex-col min-w-0">
              <span className="truncate font-medium">{eq.name}</span>
              {eq.tag && (
                <span className="text-muted-foreground font-mono text-xs truncate">{eq.tag}</span>
              )}
              {node.hasLocationDifference && eq.location?.path && (
                <span className="text-muted-foreground text-xs truncate">
                  📍 ubicación real: {eq.location.path}
                </span>
              )}
            </div>
          </div>
        </EquipmentDetailsDialog>

        <Badge
          variant="outline"
          className={cn(
            "ml-auto shrink-0 text-xs",
            eq.isOperational
              ? "border-emerald-500 bg-emerald-500/10 text-emerald-500"
              : "border-red-500 bg-red-500/10 text-red-500"
          )}
        >
          {eq.isOperational ? "Operativo" : "No operativo"}
        </Badge>

        <div className="ml-1 flex shrink-0 items-center gap-0.5 opacity-0 group-hover:opacity-100">
          {perms.canCreateEquipment && (
            <CreateEquipmentForm
              defaultParentId={eq.id}
              defaultLocationId={eq.locationId ?? undefined}
              trigger={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="size-6"
                  title="Crear sub-equipo"
                >
                  <PlusIcon className="size-3.5" />
                </Button>
              }
            />
          )}

          {perms.canUpdateEquipment && (
            <EditEquipmentForm
              id={eq.id}
              equipments={allEquipments}
              trigger={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="size-6"
                  title="Editar equipo"
                >
                  <EditIcon className="size-3.5" />
                </Button>
              }
            />
          )}
        </div>
      </div>

      {isExpanded && hasSubEquipment && depth < MAX_EQUIPMENT_DEPTH && (
        <div>
          {childQuery.isLoading && (
            <div
              className="text-muted-foreground py-1 text-xs"
              style={{ paddingLeft: `${(depth + 1) * 16 + 8}px` }}
            >
              Cargando sub-equipos...
            </div>
          )}
          {childEquipmentNodes.map((child) => (
            <EquipmentNode
              key={child.data.id}
              node={child}
              depth={depth + 1}
              expanded={expanded}
              onToggleExpand={onToggleExpand}
              allEquipments={allEquipments}
            />
          ))}
        </div>
      )}

      {depth >= MAX_EQUIPMENT_DEPTH && hasSubEquipment && (
        <div
          className="text-muted-foreground py-1 text-xs italic"
          style={{ paddingLeft: `${(depth + 1) * 16 + 8}px` }}
        >
          Profundidad máxima alcanzada
        </div>
      )}
    </div>
  )
}

// ---- Location Node ----

interface LocationNodeProps {
  node: UnifiedLocationNode
  depth: number
  expanded: Set<string>
  onToggleExpand: (id: string) => void
}

function LocationNode({ node, depth, expanded, onToggleExpand }: LocationNodeProps) {
  const perms = useUnifiedTreePermissions()
  const { matchedIds } = useUnifiedTreeSearch()
  const loc = node.data
  const isSentinel = node.isSentinel
  const isRootLocation = loc.parentId === null
  const isSearchMatch = matchedIds.size > 0 && matchedIds.has(loc.id)

  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(loc.name)
  const [createLocationOpen, setCreateLocationOpen] = useState(false)
  const [newLocationName, setNewLocationName] = useState("")

  const isExpanded = expanded.has(loc.id)
  const hasChildren = node.childLocations.length > 0 || node.hasEquipment

  const locationEquipQuery = useEquipmentsByLocation(loc.id, {
    enabled: isExpanded,
    // Sentinel must show ALL its equipment (root + sub) to expose data-quality issues
    rootOnly: !isSentinel,
  })

  const renameLocation = useRenameLocation()
  const deleteLocation = useDeleteLocation()
  const createLocation = useCreateLocation()

  const dragData = {
    type: "location" as const,
    id: loc.id,
    parentId: loc.parentId,
    name: loc.name,
  }
  const dropData = { type: "location" as const, id: loc.id, isSentinel }

  const {
    attributes,
    listeners,
    setNodeRef: setDragRef,
    isDragging,
  } = useDraggable({
    id: loc.id,
    data: dragData,
    disabled: isSentinel || isRootLocation || !perms.canUpdateLocation,
  })

  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: loc.id,
    data: dropData,
  })

  const setRef = (el: HTMLDivElement | null) => {
    setDragRef(el as HTMLElement | null)
    setDropRef(el)
  }

  const handleDoubleClick = () => {
    if (isSentinel) return
    setIsEditing(true)
    setEditValue(loc.name)
  }

  const commitRename = () => {
    const trimmed = editValue.trim()
    if (!trimmed || trimmed === loc.name) {
      setIsEditing(false)
      return
    }
    renameLocation.mutate(
      { id: loc.id, name: trimmed },
      {
        onSuccess: (result) => {
          if (!result?.ok) toast.error(result?.message ?? "Error al renombrar")
          setIsEditing(false)
        },
        onError: () => setIsEditing(false),
      }
    )
  }

  const handleConfirmDelete = () => {
    deleteLocation.mutate(
      { id: loc.id },
      {
        onSuccess: (result) => {
          if (!result?.ok) toast.error(result?.message ?? "Error al eliminar")
        },
      }
    )
  }

  const handleConfirmCreateLocation = () => {
    const trimmed = newLocationName.trim()
    if (!trimmed) return
    createLocation.mutate(
      { name: trimmed, parentId: loc.id },
      {
        onSuccess: (result) => {
          if (!result?.ok) toast.error(result?.message ?? "Error al crear ubicación")
          else {
            setNewLocationName("")
            setCreateLocationOpen(false)
          }
        },
        onError: () => toast.error("Error al crear ubicación"),
      }
    )
  }

  const locationEquipmentNodes: UnifiedEquipmentNode[] =
    isExpanded && locationEquipQuery.data?.equipments
      ? locationEquipQuery.data.equipments.map((eq) => ({
          kind: "equipment" as const,
          data: eq,
          children: [],
          inheritedLocationId: loc.id,
          hasLocationDifference: eq.locationId !== loc.id,
        }))
      : []

  const equipmentsForEditForm = locationEquipQuery.data?.equipments ?? []

  return (
    <div>
      <div
        ref={setRef}
        className={cn(
          "group flex items-center gap-1 rounded-md px-2 py-1.5 text-sm transition-colors",
          "hover:bg-muted/40",
          isDragging && "opacity-50",
          isOver && !isDragging && "bg-primary/10 ring-1 ring-inset ring-primary/50",
          isSearchMatch && "bg-yellow-200/30 dark:bg-yellow-300/15"
        )}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        <Button
          variant="ghost"
          size="icon-sm"
          className={cn(
            "size-5 shrink-0",
            isSentinel || isRootLocation || !perms.canUpdateLocation
              ? "cursor-default opacity-0 pointer-events-none"
              : "cursor-grab opacity-40 hover:bg-transparent hover:opacity-100 active:cursor-grabbing"
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
          onClick={() => onToggleExpand(loc.id)}
          tabIndex={-1}
        >
          {isExpanded ? (
            <ChevronDownIcon className="size-3.5" />
          ) : (
            <ChevronRightIcon className="size-3.5" />
          )}
        </Button>

        <MapPinIcon className="text-muted-foreground size-3.5 shrink-0" />

        {isEditing ? (
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitRename()
              if (e.key === "Escape") setIsEditing(false)
            }}
            className="h-6 flex-1 px-1 py-0 text-sm"
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
            {loc.name}
          </span>
        )}

        {loc.equipmentCount > 0 && (
          <Badge variant="secondary" className="ml-auto shrink-0 text-xs">
            {loc.equipmentCount}
          </Badge>
        )}

        <div className="ml-1 flex shrink-0 items-center gap-0.5 opacity-0 group-hover:opacity-100">
          {perms.canCreateLocation && (
            <AlertDialog open={createLocationOpen} onOpenChange={setCreateLocationOpen}>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="size-6"
                  title="Crear sub-ubicación"
                >
                  <PlusIcon className="size-3.5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Nueva sub-ubicación</AlertDialogTitle>
                  <AlertDialogDescription>
                    Crear una ubicación hija de <strong>{loc.name}</strong>.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <Input
                  value={newLocationName}
                  onChange={(e) => setNewLocationName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleConfirmCreateLocation()
                    if (e.key === "Escape") setCreateLocationOpen(false)
                  }}
                  placeholder="Nombre de la ubicación"
                  autoFocus
                />
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setNewLocationName("")}>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleConfirmCreateLocation}
                    disabled={!newLocationName.trim()}
                  >
                    Crear
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {perms.canCreateEquipment && (
            <CreateEquipmentForm
              defaultLocationId={loc.id}
              trigger={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="size-6"
                  title="Crear equipo en esta ubicación"
                >
                  <WrenchIcon className="size-3.5" />
                </Button>
              }
            />
          )}

          {perms.canUpdateLocation && !isSentinel && (
            <Button
              variant="ghost"
              size="icon-sm"
              className="size-6"
              title="Renombrar ubicación"
              onClick={handleDoubleClick}
            >
              <EditIcon className="size-3.5" />
            </Button>
          )}

          {perms.canDeleteLocation && !isSentinel && (
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
                    ¿Eliminar <strong>{loc.name}</strong>? Esta acción no se puede deshacer.
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

      {isExpanded && (
        <div>
          {locationEquipQuery.isLoading && (
            <div
              className="text-muted-foreground py-1 text-xs"
              style={{ paddingLeft: `${(depth + 1) * 16 + 8}px` }}
            >
              Cargando equipos...
            </div>
          )}

          {node.childLocations.map((child) => (
            <LocationNode
              key={child.data.id}
              node={child}
              depth={depth + 1}
              expanded={expanded}
              onToggleExpand={onToggleExpand}
            />
          ))}

          {locationEquipmentNodes.map((eq) => (
            <EquipmentNode
              key={eq.data.id}
              node={eq}
              depth={depth + 1}
              expanded={expanded}
              onToggleExpand={onToggleExpand}
              allEquipments={equipmentsForEditForm}
              flatLeafMode={isSentinel}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ---- Public API ----

export interface UnifiedTreeNodeProps {
  node: UnifiedLocationNode | UnifiedEquipmentNode
  depth?: number
  expanded: Set<string>
  onToggleExpand: (id: string) => void
}

export function UnifiedTreeNode({ node, depth = 0, expanded, onToggleExpand }: UnifiedTreeNodeProps) {
  if (node.kind === "location") {
    return (
      <LocationNode
        node={node}
        depth={depth}
        expanded={expanded}
        onToggleExpand={onToggleExpand}
      />
    )
  }

  return (
    <EquipmentNode
      node={node}
      depth={depth}
      expanded={expanded}
      onToggleExpand={onToggleExpand}
      allEquipments={[]}
    />
  )
}
