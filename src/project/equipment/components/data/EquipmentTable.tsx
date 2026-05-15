"use client"

import { Columns3Icon, FileSpreadsheetIcon } from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"
import {
	type ExpandedState,
	type OnChangeFn,
	type PaginationState,
	type SortingState,
	getCoreRowModel,
	getExpandedRowModel,
	useReactTable,
} from "@tanstack/react-table"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { useEquipmentFilters } from "@/project/equipment/hooks/use-equipment-filters"
import { useRootEquipments } from "@/project/equipment/hooks/use-root-equipments"
import { getEquipmentColumns } from "@/project/equipment/columns/equipment-columns"
import { EquipmentTreeContext } from "@/project/equipment/contexts/equipment-tree-context"
import { EquipmentChildrenSubTable } from "@/project/equipment/components/data/EquipmentChildrenSubTable"
import {
	EquipmentTreeDndProvider,
	RootDropZone,
	type CycleDetectionMap,
} from "@/project/equipment/components/data/EquipmentTreeDndProvider"
import {
	fetchAllEquipments,
	type EquipmentSortBy,
	type WorkEquipment,
} from "@/project/equipment/hooks/use-equipments"

import { DataGridColumnVisibility } from "@/shared/components/data-grid/data-grid-column-visibility"
import { DataGridPagination } from "@/shared/components/data-grid/data-grid-pagination"
import { DataGrid, DataGridContainer } from "@/shared/components/data-grid/data-grid"
import { DataGridTable } from "@/shared/components/data-grid/data-grid-table"
import { EquipmentDraggableTableRenderer } from "@/project/equipment/components/data/EquipmentDraggableTableRenderer"
import { DataGridToolbar } from "@/shared/components/data-grid/data-grid-toolbar"
import { Card, CardContent } from "@/shared/components/ui/card"
import RefreshButton from "@/shared/components/RefreshButton"
import SearchInput from "@/shared/components/SearchInput"
import { Button } from "@/shared/components/ui/button"
import Spinner from "@/shared/components/Spinner"

interface EquipmentTableProps {
	parentId: string | null
	id?: string
}

const SORTING_COLUMN_TO_API: Record<string, EquipmentSortBy> = {
	name: "name",
	tag: "tag",
	location: "location",
	type: "type",
	isOperational: "isOperational",
}

const API_SORT_TO_COLUMN: Partial<Record<EquipmentSortBy, string>> = {
	name: "name",
	tag: "tag",
	location: "location",
	type: "type",
	isOperational: "isOperational",
	createdAt: "name",
	updatedAt: "name",
}

export function EquipmentTable({ parentId, id }: EquipmentTableProps) {
	const isTreeMode = parentId === null

	const [exportLoading, setExportLoading] = useState<boolean>(false)
	const [expandedRows, setExpandedRows] = useState<ExpandedState>({})

	const {
		actions,
		filters,
		equipments: { data: flatData, isLoading: flatLoading, isFetching: flatFetching, refetch: flatRefetch },
	} = useEquipmentFilters(parentId)

	const router = useRouter()

	const handleNavigateToChildren = useCallback(
		(equipmentId: string) => {
			router.push(`/admin/dashboard/historial-equipos?equipmentId=${equipmentId}`)
		},
		[router]
	)

	const isSearchActive = isTreeMode && !!filters.search

	useEffect(() => {
		if (isSearchActive) {
			setExpandedRows({})
		}
	}, [isSearchActive])

	const {
		data: rootData,
		isLoading: rootLoading,
		isFetching: rootFetching,
		refetch: rootRefetch,
	} = useRootEquipments({
		search: filters.search,
		orderBy: filters.orderBy,
		order: filters.order,
		enabled: isTreeMode,
	})

	const useRootData = isTreeMode && !isSearchActive
	const data = useRootData ? rootData : flatData
	const isLoading = useRootData ? rootLoading : flatLoading
	const isFetching = useRootData ? rootFetching : flatFetching
	const refetch = useRootData ? rootRefetch : flatRefetch

	const equipmentMap = useMemo<CycleDetectionMap>(() => {
		if (!isTreeMode) return new Map()
		const map: CycleDetectionMap = new Map()
		for (const eq of data?.equipments ?? []) {
			map.set(eq.id, { id: eq.id, parentId: eq.parentId })
		}
		return map
	}, [isTreeMode, data?.equipments])

	const treeColumns = useMemo(() => {
		const cols = getEquipmentColumns({
			equipments: data?.equipments ?? [],
			onNavigateToHistory: handleNavigateToChildren,
			mode: "tree",
		})

		const expanderCol = cols.find((c) => c.id === "expander")
		if (expanderCol) {
			expanderCol.meta = {
				...expanderCol.meta,
				expandedContent: (row: WorkEquipment) => (
					<EquipmentChildrenSubTable
						parentId={row.id}
						depth={0}
						onNavigateToHistory={handleNavigateToChildren}
					/>
				),
			}
		}

		return cols
	}, [data?.equipments, handleNavigateToChildren])

	const flatColumns = useMemo(
		() =>
			getEquipmentColumns({
				equipments: data?.equipments ?? [],
				onNavigateToHistory: handleNavigateToChildren,
				mode: "flat",
			}),
		[data?.equipments, handleNavigateToChildren]
	)

	const sortingState: SortingState = filters.orderBy
		? [{ id: API_SORT_TO_COLUMN[filters.orderBy] ?? "name", desc: filters.order === "desc" }]
		: []

	const handleSortingChange: OnChangeFn<SortingState> = useCallback(
		(updater) => {
			const nextSorting = typeof updater === "function" ? updater(sortingState) : updater
			const firstSort = nextSorting[0]

			if (!firstSort) {
				actions.setOrderBy("createdAt")
				actions.setOrder("desc")
				return
			}

			const nextOrderBy = SORTING_COLUMN_TO_API[firstSort.id]
			if (!nextOrderBy) return

			actions.setOrderBy(nextOrderBy)
			actions.setOrder(firstSort.desc ? "desc" : "asc")
		},
		[actions, sortingState]
	)

	const handlePaginationChange: OnChangeFn<PaginationState> = useCallback(
		(updater) => {
			const currentPagination = {
				pageIndex: filters.page - 1,
				pageSize: filters.pageSize,
			}

			const nextPagination = typeof updater === "function" ? updater(currentPagination) : updater

			if (nextPagination.pageSize !== currentPagination.pageSize) {
				actions.setPageSize(nextPagination.pageSize)
			}

			if (nextPagination.pageIndex !== currentPagination.pageIndex) {
				actions.setPage(nextPagination.pageIndex + 1)
			}
		},
		[actions, filters.page, filters.pageSize]
	)

	const treeTable = useReactTable<WorkEquipment>({
		data: data?.equipments ?? [],
		columns: treeColumns,
		getCoreRowModel: getCoreRowModel(),
		getExpandedRowModel: getExpandedRowModel(),
		getRowCanExpand: (row) => !isSearchActive && row.original._count.children > 0,
		state: {
			sorting: sortingState,
			expanded: expandedRows,
		},
		onSortingChange: handleSortingChange,
		onExpandedChange: setExpandedRows,
		manualSorting: true,
		enableMultiSort: false,
		enableColumnPinning: true,
		columnResizeMode: "onChange",
	})

	const flatTable = useReactTable<WorkEquipment>({
		data: data?.equipments ?? [],
		columns: flatColumns,
		getCoreRowModel: getCoreRowModel(),
		state: {
			sorting: sortingState,
			pagination: {
				pageIndex: filters.page - 1,
				pageSize: filters.pageSize,
			},
		},
		onSortingChange: handleSortingChange,
		onPaginationChange: handlePaginationChange,
		manualSorting: true,
		enableMultiSort: false,
		manualPagination: true,
		enableColumnPinning: true,
		columnResizeMode: "onChange",
		pageCount: data?.pages ?? 0,
	})

	const table = isTreeMode && !isSearchActive ? treeTable : flatTable

	const handleExportToExcel = async () => {
		try {
			setExportLoading(true)
			const equipments = await fetchAllEquipments(parentId)
			if (!equipments?.length) {
				toast.error("No hay equipos para exportar")
				return
			}

			const XLSX = await import("xlsx")

			const workbook = XLSX.utils.book_new()
			const worksheet = XLSX.utils.json_to_sheet(
				equipments.map((equipment: WorkEquipment) => ({
					"TAG": equipment.tag,
					"Nombre": equipment.name,
					"Ubicacion": equipment.location?.path ?? "",
					"Descripcion": equipment.description,
					"Estado": equipment.isOperational ? "Operativo" : "No Operativo",
					"Tipo": equipment.type || "N/A",
					"Ordenes de Trabajo": equipment._count.workOrders,
					"Equipos Hijos": equipment._count.children,
					"Fecha de Creacion": new Date(equipment.createdAt).toLocaleDateString(),
					"Ultima Actualizacion": new Date(equipment.updatedAt).toLocaleDateString(),
				}))
			)

			XLSX.utils.book_append_sheet(workbook, worksheet, "Equipos")
			XLSX.writeFile(workbook, "equipos.xlsx")
			toast.success("Equipos exportados exitosamente")
		} catch (error) {
			console.error("[EXPORT_EXCEL]", error)
			toast.error("Error al exportar equipos")
		} finally {
			setExportLoading(false)
		}
	}

	return (
		<div id={id} className="space-y-3">
			<DataGridToolbar>
				<div className="flex w-full flex-col items-end gap-2 sm:flex-row sm:flex-wrap">
					<SearchInput
						value={filters.search}
						setPage={actions.setPage}
						onChange={actions.setSearch}
						className="w-full lg:w-80"
						inputClassName="h-9 bg-background"
						iconClassName="top-4.5"
						placeholder="Buscar por nombre, TAG o ubicacion..."
					/>

					<div className="ml-auto flex items-center justify-end gap-2">
						<Button
							onClick={handleExportToExcel}
							disabled={isLoading || exportLoading || !data?.equipments?.length}
							variant="outline"
							size="lg"
							className="text-emerald-600 hover:bg-emerald-600 hover:text-white"
						>
							{exportLoading ? <Spinner /> : <FileSpreadsheetIcon className="h-4 w-4" />}
							Exportar
						</Button>

						<RefreshButton refetch={refetch} isFetching={isFetching} size="md" />

						<DataGridColumnVisibility
							table={table}
							trigger={
								<Button size="icon" variant="outline" className="size-9">
									<Columns3Icon className="size-4" />
								</Button>
							}
						/>

					</div>
				</div>
			</DataGridToolbar>

			{isSearchActive && (
				<div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400">
					Búsqueda activa: vista de árbol deshabilitada. Limpiá la búsqueda para volver al árbol.
				</div>
			)}

			<Card>
				<CardContent className="flex w-full flex-col items-start gap-4">
					{isTreeMode && !isSearchActive ? (
						<EquipmentTreeDndProvider
							equipmentMap={equipmentMap}
							expandedRows={expandedRows}
							onExpandedChange={setExpandedRows}
						>
							<EquipmentTreeContext.Provider value={{ depth: 0, onNavigateToHistory: handleNavigateToChildren }}>
								<DataGrid<WorkEquipment>
									table={treeTable}
									recordCount={data?.total ?? 0}
									isLoading={isLoading}
									emptyMessage="No hay equipos"
									tableLayout={{
										columnsVisibility: true,
										columnsResizable: true,
										columnsPinnable: true,
										width: "fixed",
									}}
								>
									<RootDropZone />
									<DataGridContainer border={false} className="w-full overflow-x-auto">
										<EquipmentDraggableTableRenderer />
									</DataGridContainer>
								</DataGrid>
							</EquipmentTreeContext.Provider>
						</EquipmentTreeDndProvider>
					) : (
						<DataGrid<WorkEquipment>
							table={flatTable}
							recordCount={data?.total ?? 0}
							isLoading={isLoading || isFetching}
							emptyMessage="No hay equipos"
							tableLayout={{
								columnsVisibility: true,
								columnsResizable: true,
								columnsPinnable: true,
								width: "fixed",
							}}
						>
							<DataGridContainer border={false} className="w-full overflow-x-auto">
								<DataGridTable<WorkEquipment> />
							</DataGridContainer>
							<DataGridPagination
								rowsPerPageLabel="Filas por pagina"
								previousPageLabel="Pagina anterior"
								nextPageLabel="Pagina siguiente"
								info="{from} - {to} de {count}"
							/>
						</DataGrid>
					)}
				</CardContent>
			</Card>
		</div>
	)
}
