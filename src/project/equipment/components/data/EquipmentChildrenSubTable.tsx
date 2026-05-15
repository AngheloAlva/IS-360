"use client"

import { useMemo, useState } from "react"
import {
	getCoreRowModel,
	getExpandedRowModel,
	useReactTable,
	type ExpandedState,
} from "@tanstack/react-table"

import { useChildEquipments } from "@/project/equipment/hooks/use-child-equipments"
import { getEquipmentColumns } from "@/project/equipment/columns/equipment-columns"
import { EquipmentTreeContext } from "@/project/equipment/contexts/equipment-tree-context"
import { EquipmentDraggableTableRenderer } from "@/project/equipment/components/data/EquipmentDraggableTableRenderer"
import { DataGrid, DataGridContainer } from "@/shared/components/data-grid/data-grid"
import { Button } from "@/shared/components/ui/button"
import { Skeleton } from "@/shared/components/ui/skeleton"

import type { WorkEquipment } from "@/project/equipment/hooks/use-equipments"

export interface EquipmentChildrenSubTableProps {
	parentId: string
	depth: number
	maxDepth?: number
	onNavigateToHistory: (equipmentId: string) => void
}

const DEFAULT_MAX_DEPTH = 5

export function EquipmentChildrenSubTable({
	parentId,
	depth,
	maxDepth = DEFAULT_MAX_DEPTH,
	onNavigateToHistory,
}: EquipmentChildrenSubTableProps) {
	const [expandedRows, setExpandedRows] = useState<ExpandedState>({})

	const { data, isLoading, isError, refetch } = useChildEquipments({
		parentId,
		orderBy: "name",
		order: "asc",
	})

	const canExpand = depth < maxDepth

	const columns = useMemo(() => {
		const cols = getEquipmentColumns({
			equipments: data?.equipments ?? [],
			onNavigateToHistory,
			mode: canExpand ? "tree" : "flat",
		})

		if (canExpand) {
			const expanderCol = cols.find((c) => c.id === "expander")
			if (expanderCol) {
				expanderCol.meta = {
					...expanderCol.meta,
					expandedContent: (row: WorkEquipment) => (
						<EquipmentChildrenSubTable
							parentId={row.id}
							depth={depth + 1}
							maxDepth={maxDepth}
							onNavigateToHistory={onNavigateToHistory}
						/>
					),
				}
			}
		}

		return cols
	}, [data?.equipments, onNavigateToHistory, canExpand, depth, maxDepth])

	const table = useReactTable<WorkEquipment>({
		data: data?.equipments ?? [],
		columns,
		getCoreRowModel: getCoreRowModel(),
		getExpandedRowModel: getExpandedRowModel(),
		getRowCanExpand: (row) => canExpand && row.original._count.children > 0,
		state: {
			expanded: expandedRows,
		},
		onExpandedChange: setExpandedRows,
		manualSorting: true,
		enableMultiSort: false,
		enableColumnPinning: true,
		columnResizeMode: "onChange",
	})

	const indentStyle = { marginLeft: `${(depth + 1) * 24}px` }

	if (isLoading) {
		return (
			<div className="border-l-2 border-muted bg-muted/20 space-y-2 px-4 py-3" style={indentStyle}>
				{Array.from({ length: 3 }).map((_, i) => (
					<Skeleton key={i} className="h-8 w-full" />
				))}
			</div>
		)
	}

	if (isError) {
		return (
			<div className="border-l-2 border-muted bg-muted/20 flex items-center gap-3 px-4 py-3" style={indentStyle}>
				<span className="text-sm text-muted-foreground">Error al cargar sub-equipos</span>
				<Button variant="outline" size="sm" onClick={() => refetch()}>
					Reintentar
				</Button>
			</div>
		)
	}

	if (!data?.equipments?.length) {
		return (
			<div className="border-l-2 border-muted bg-muted/20 px-4 py-3" style={indentStyle}>
				<span className="text-sm text-muted-foreground">Sin sub-equipos</span>
			</div>
		)
	}

	return (
		<EquipmentTreeContext.Provider value={{ depth: depth + 1, onNavigateToHistory }}>
			<div className="border-l-2 border-muted bg-muted/20" style={indentStyle}>
				<DataGrid<WorkEquipment>
					table={table}
					recordCount={data.equipments.length}
					isLoading={false}
					emptyMessage="Sin sub-equipos"
					tableLayout={{
						columnsVisibility: true,
						columnsResizable: true,
						columnsPinnable: true,
						width: "fixed",
					}}
				>
					<DataGridContainer border={false} className="w-full overflow-x-auto">
						<EquipmentDraggableTableRenderer />
					</DataGridContainer>
				</DataGrid>
			</div>
		</EquipmentTreeContext.Provider>
	)
}
