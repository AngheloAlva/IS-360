"use client"

import { useState } from "react"
import { PlusIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/shared/components/ui/dialog"
import { useLocations, type WorkLocation } from "@/project/location/hooks/use-locations"
import { useCreateLocation } from "@/project/location/hooks/use-create-location"
import { LocationTreeDndProvider } from "@/project/location/components/data/LocationTreeDndProvider"
import { LocationDraggableNode } from "@/project/location/components/data/LocationDraggableNode"

interface CreateDialogState {
	open: boolean
	parentId: string | null
}

interface TreeNode extends WorkLocation {
	children: TreeNode[]
}

function buildTree(flat: WorkLocation[]): TreeNode[] {
	const byId = new Map<string, TreeNode>(
		flat.map((l) => ({ ...l, children: [] })).map((n) => [n.id, n])
	)
	const roots: TreeNode[] = []

	for (const node of byId.values()) {
		if (node.parentId === null) {
			roots.push(node)
		} else {
			const parent = byId.get(node.parentId)
			if (parent) {
				parent.children.push(node)
			} else {
				roots.push(node)
			}
		}
	}

	const sortNodes = (nodes: TreeNode[]) => {
		nodes.sort((a, b) => a.name.localeCompare(b.name))
		for (const n of nodes) sortNodes(n.children)
	}
	sortNodes(roots)

	return roots
}

interface RenderTreeProps {
	nodes: TreeNode[]
	depth: number
	expanded: Set<string>
	onToggle: (id: string) => void
	onCreateChild: (parentId: string) => void
	canCreate: boolean
	canDelete: boolean
}

function RenderTree({ nodes, depth, expanded, onToggle, onCreateChild, canCreate, canDelete }: RenderTreeProps) {
	return (
		<>
			{nodes.map((node) => {
				const isSentinel = node.name === "Sin ubicación" && node.parentId === null
				const isExpanded = expanded.has(node.id)
				const hasChildren = node.children.length > 0

				return (
					<div key={node.id}>
						<LocationDraggableNode
							location={node}
							depth={depth}
							isExpanded={isExpanded}
							hasChildren={hasChildren}
							onToggleExpand={onToggle}
							onCreateChild={onCreateChild}
							canCreate={canCreate}
							canDelete={canDelete}
							isSentinel={isSentinel}
						/>
						{isExpanded && hasChildren && (
							<RenderTree
								nodes={node.children}
								depth={depth + 1}
								expanded={expanded}
								onToggle={onToggle}
								onCreateChild={onCreateChild}
								canCreate={canCreate}
								canDelete={canDelete}
							/>
						)}
					</div>
				)
			})}
		</>
	)
}

interface LocationTreePageProps {
	canCreate: boolean
	canDelete: boolean
}

export function LocationTreePage({ canCreate, canDelete }: LocationTreePageProps) {
	const { data: locations, isLoading, isError } = useLocations()
	const createLocation = useCreateLocation()

	const [expanded, setExpanded] = useState<Set<string>>(new Set())
	const [createDialog, setCreateDialog] = useState<CreateDialogState>({ open: false, parentId: null })
	const [newName, setNewName] = useState("")

	const handleToggle = (id: string) => {
		setExpanded((prev) => {
			const next = new Set(prev)
			if (next.has(id)) next.delete(id)
			else next.add(id)
			return next
		})
	}

	const handleOpenCreateDialog = (parentId: string | null) => {
		setNewName("")
		setCreateDialog({ open: true, parentId })
	}

	const handleCreateSubmit = () => {
		const trimmed = newName.trim()
		if (!trimmed) return

		createLocation.mutate(
			{ name: trimmed, parentId: createDialog.parentId },
			{
				onSuccess: (result) => {
					if (!result?.ok) {
						toast.error(result?.message ?? "Error al crear la ubicación")
					} else {
						setCreateDialog({ open: false, parentId: null })
						if (createDialog.parentId) {
							setExpanded((prev) => new Set([...prev, createDialog.parentId!]))
						}
					}
				},
			}
		)
	}

	const tree = locations ? buildTree(locations) : []

	return (
		<div className="flex h-full w-full flex-1 flex-col gap-6 overflow-hidden">
			<div className="rounded-lg bg-linear-to-r from-slate-600 to-slate-700 p-6 dark:from-slate-800 dark:to-slate-900">
				<div className="flex items-center justify-between">
					<div className="text-white">
						<h1 className="text-3xl font-bold tracking-tight">Ubicaciones</h1>
						<p className="opacity-90">Gestión de la jerarquía de ubicaciones</p>
					</div>
					{canCreate && (
						<Button
							variant="secondary"
							onClick={() => handleOpenCreateDialog(null)}
							className="gap-1.5"
						>
							<PlusIcon className="size-4" />
							Crear raíz
						</Button>
					)}
				</div>
			</div>

			<div className="flex-1 overflow-auto rounded-lg border">
				{isLoading && (
					<div className="flex items-center justify-center p-8 text-sm text-muted-foreground">
						Cargando ubicaciones...
					</div>
				)}
				{isError && (
					<div className="flex items-center justify-center p-8 text-sm text-destructive">
						Error al cargar las ubicaciones
					</div>
				)}
				{!isLoading && !isError && (
					<LocationTreeDndProvider locations={locations ?? []}>
						<div className="p-2">
							{tree.length === 0 ? (
								<div className="flex items-center justify-center p-8 text-sm text-muted-foreground">
									No hay ubicaciones creadas
								</div>
							) : (
								<RenderTree
									nodes={tree}
									depth={0}
									expanded={expanded}
									onToggle={handleToggle}
									onCreateChild={handleOpenCreateDialog}
									canCreate={canCreate}
									canDelete={canDelete}
								/>
							)}
						</div>
					</LocationTreeDndProvider>
				)}
			</div>

			<Dialog open={createDialog.open} onOpenChange={(open) => setCreateDialog((prev) => ({ ...prev, open }))}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>
							{createDialog.parentId ? "Crear ubicación hija" : "Crear ubicación raíz"}
						</DialogTitle>
					</DialogHeader>
					<Input
						value={newName}
						onChange={(e) => setNewName(e.target.value)}
						placeholder="Nombre de la ubicación"
						onKeyDown={(e) => {
							if (e.key === "Enter") handleCreateSubmit()
						}}
						autoFocus
					/>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setCreateDialog({ open: false, parentId: null })}
						>
							Cancelar
						</Button>
						<Button
							onClick={handleCreateSubmit}
							disabled={!newName.trim() || createLocation.isPending}
						>
							Crear
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	)
}
