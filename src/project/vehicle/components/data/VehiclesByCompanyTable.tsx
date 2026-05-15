"use client"

import { Columns3Icon, FilterIcon, FilterXIcon } from "lucide-react"
import { useState, useMemo, useCallback } from "react"
import {
	type OnChangeFn,
	type PaginationState,
	type SortingState,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table"

import { useVehiclesByCompany, type Vehicle } from "@/project/vehicle/hooks/use-vehicles-by-company"
import { vehicleColumns } from "@/project/vehicle/columns/vehicle-columns"
import { VehicleTypeOptions } from "@/lib/consts/vehicle-types"
import { useDebounce } from "@/shared/hooks/useDebounce"

import { DataGridColumnVisibility } from "@/shared/components/data-grid/data-grid-column-visibility"
import { DataGridPagination } from "@/shared/components/data-grid/data-grid-pagination"
import { DataGrid, DataGridContainer } from "@/shared/components/data-grid/data-grid"
import { DataGridTable } from "@/shared/components/data-grid/data-grid-table"
import {
	DataGridToolbar,
	DataGridActiveFilters,
	type DataGridActiveFilter,
} from "@/shared/components/data-grid/data-grid-toolbar"
import { Card, CardContent } from "@/shared/components/ui/card"
import RefreshButton from "@/shared/components/RefreshButton"
import SearchInput from "@/shared/components/SearchInput"
import { Button } from "@/shared/components/ui/button"
import {
	DropdownMenu,
	DropdownMenuSub,
	DropdownMenuLabel,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuRadioGroup,
	DropdownMenuSubTrigger,
	DropdownMenuSubContent,
} from "@/shared/components/ui/dropdown-menu"

import type { VEHICLE_TYPE } from "@/generated/prisma/enums"

type VehicleSortBy = "plate" | "model" | "year" | "brand" | "type" | "isMain" | "createdAt"

const SORTING_COLUMN_TO_API: Record<string, VehicleSortBy> = {
	plate: "plate",
	model: "model",
	year: "year",
	brand: "brand",
	type: "type",
	isMain: "isMain",
}

const API_SORT_TO_COLUMN: Partial<Record<VehicleSortBy, string>> = {
	plate: "plate",
	model: "model",
	year: "year",
	brand: "brand",
	type: "type",
	isMain: "isMain",
	createdAt: "plate",
}

export function VehiclesByCompanyTable({ companyId }: { companyId: string }) {
	const [typeFilter, setTypeFilter] = useState<VEHICLE_TYPE | undefined>(undefined)
	const [search, setSearch] = useState("")
	const [page, setPage] = useState(1)
	const [pageSize, setPageSize] = useState(15)
	const [sortBy, setSortBy] = useState<VehicleSortBy>("createdAt")
	const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

	const debouncedSearch = useDebounce(search)

	const { data, isLoading, refetch, isFetching } = useVehiclesByCompany({
		page,
		search: debouncedSearch,
		pageSize,
		companyId,
		typeFilter,
		sortBy,
		sortOrder,
	})

	const sortingState: SortingState = API_SORT_TO_COLUMN[sortBy]
		? [{ id: API_SORT_TO_COLUMN[sortBy]!, desc: sortOrder === "desc" }]
		: []

	const handleSortingChange: OnChangeFn<SortingState> = useCallback(
		(updater) => {
			const nextSorting = typeof updater === "function" ? updater(sortingState) : updater
			const firstSort = nextSorting[0]

			if (!firstSort) {
				setSortBy("createdAt")
				setSortOrder("desc")
				setPage(1)
				return
			}

			const nextSortBy = SORTING_COLUMN_TO_API[firstSort.id]
			if (!nextSortBy) return

			setSortBy(nextSortBy)
			setSortOrder(firstSort.desc ? "desc" : "asc")
			setPage(1)
		},
		[sortingState]
	)

	const handlePaginationChange: OnChangeFn<PaginationState> = useCallback(
		(updater) => {
			const currentPagination = {
				pageIndex: page - 1,
				pageSize,
			}

			const nextPagination = typeof updater === "function" ? updater(currentPagination) : updater

			if (nextPagination.pageSize !== currentPagination.pageSize) {
				setPageSize(nextPagination.pageSize)
				setPage(1)
			}

			if (nextPagination.pageIndex !== currentPagination.pageIndex) {
				setPage(nextPagination.pageIndex + 1)
			}
		},
		[page, pageSize]
	)

	const table = useReactTable<Vehicle>({
		columns: vehicleColumns,
		onSortingChange: handleSortingChange,
		data: data?.vehicles ?? [],
		getCoreRowModel: getCoreRowModel(),
		state: {
			sorting: sortingState,
			pagination: {
				pageIndex: page - 1,
				pageSize,
			},
		},
		onPaginationChange: handlePaginationChange,
		manualSorting: true,
		enableMultiSort: false,
		manualPagination: true,
		enableColumnPinning: true,
		columnResizeMode: "onChange",
		pageCount: data?.pages ?? 0,
	})

	const activeFilters = useMemo<DataGridActiveFilter[]>(
		() =>
			[
				search
					? {
							key: "search",
							label: `Busqueda: ${search}`,
							onClear: () => setSearch(""),
						}
					: null,
				typeFilter
					? {
							key: "type",
							label: `Tipo: ${VehicleTypeOptions.find((type) => type.value === typeFilter)?.label ?? typeFilter}`,
							onClear: () => setTypeFilter(undefined),
						}
					: null,
			].filter((value): value is DataGridActiveFilter => value !== null),
		[search, typeFilter]
	)

	const resetFilters = () => {
		setSearch("")
		setTypeFilter(undefined)
		setPage(1)
		setPageSize(15)
		setSortBy("createdAt")
		setSortOrder("desc")
	}

	return (
		<div className="space-y-3">
			<DataGridToolbar>
				<div className="flex w-full flex-col items-end gap-2 sm:flex-row sm:flex-wrap">
					<SearchInput
						value={search}
						setPage={setPage}
						onChange={setSearch}
						className="w-full lg:w-80"
						inputClassName="h-9 bg-background"
						iconClassName="top-4.5"
						placeholder="Buscar por patente, modelo o marca..."
					/>

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline" size="lg">
								<FilterIcon className="size-4" />
								Filtros
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent className="w-64" align="start">
							<DropdownMenuLabel>Filtros de tabla</DropdownMenuLabel>
							<DropdownMenuSeparator />

							<DropdownMenuSub>
								<DropdownMenuSubTrigger>Tipo</DropdownMenuSubTrigger>
								<DropdownMenuSubContent className="w-56">
									<DropdownMenuRadioGroup
										value={typeFilter ?? "all"}
										onValueChange={(value) => {
											setTypeFilter(value === "all" ? undefined : (value as VEHICLE_TYPE))
											setPage(1)
										}}
									>
										<DropdownMenuRadioItem value="all">Todos los tipos</DropdownMenuRadioItem>
										{VehicleTypeOptions.map((type) => (
											<DropdownMenuRadioItem key={type.value} value={type.value}>
												{type.label}
											</DropdownMenuRadioItem>
										))}
									</DropdownMenuRadioGroup>
								</DropdownMenuSubContent>
							</DropdownMenuSub>
						</DropdownMenuContent>
					</DropdownMenu>

					<div className="ml-auto flex items-center justify-end gap-2">
						<RefreshButton refetch={refetch} isFetching={isFetching} size="md" />

						<DataGridColumnVisibility
							table={table}
							trigger={
								<Button size="icon" variant="outline" className="size-9">
									<Columns3Icon className="size-4" />
								</Button>
							}
						/>

						<Button
							size="icon"
							variant="outline"
							onClick={resetFilters}
							className="size-9 text-teal-600 hover:bg-teal-600 hover:text-white"
						>
							<FilterXIcon className="size-4" />
						</Button>
					</div>
				</div>

				<DataGridActiveFilters filters={activeFilters} />
			</DataGridToolbar>

			<Card>
				<CardContent className="flex w-full flex-col items-start gap-4">
					<DataGrid<Vehicle>
						table={table}
						recordCount={data?.total ?? 0}
						isLoading={isLoading || isFetching}
						emptyMessage="No hay vehiculos"
						tableLayout={{
							columnsVisibility: true,
							columnsResizable: true,
							columnsPinnable: true,
							width: "fixed",
						}}
					>
						<DataGridContainer border={false} className="w-full overflow-x-auto">
							<DataGridTable<Vehicle> />
						</DataGridContainer>
						<DataGridPagination
							rowsPerPageLabel="Filas por pagina"
							previousPageLabel="Pagina anterior"
							nextPageLabel="Pagina siguiente"
							info="{from} - {to} de {count}"
						/>
					</DataGrid>
				</CardContent>
			</Card>
		</div>
	)
}
