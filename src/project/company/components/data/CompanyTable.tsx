"use client"

import { Columns3Icon, FilterIcon, FilterXIcon } from "lucide-react"
import { useCallback, useMemo } from "react"
import {
	type OnChangeFn,
	type PaginationState,
	type SortingState,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table"

import { useCompanyFilters } from "@/project/company/hooks/use-company-filters"
import { CompanyColumns } from "@/project/company/columns/company-columns"

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

import type { Company } from "@/project/company/hooks/use-companies"
import type { OrderBy } from "@/shared/components/OrderByButton"

const STATUS_LABEL: Record<"all" | "active" | "inactive", string> = {
	all: "Todas",
	active: "Activas",
	inactive: "Inactivas",
}

export function CompanyTable() {
	const {
		companies: { isLoading, refetch, isFetching, data },
		actions,
		filters,
	} = useCompanyFilters(true)

	const sortingState: SortingState = filters.orderBy
		? [{ id: filters.orderBy, desc: filters.order === "desc" }]
		: []

	const handleSortingChange: OnChangeFn<SortingState> = useCallback(
		(updater) => {
			const nextSorting = typeof updater === "function" ? updater(sortingState) : updater
			const firstSort = nextSorting[0]

			if (!firstSort) {
				actions.setOrderBy("name")
				actions.setOrder("asc")
				return
			}

			actions.setOrderBy(firstSort.id as OrderBy)
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

	const table = useReactTable<Company>({
		data: data?.companies ?? [],
		columns: CompanyColumns,
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

	const activeFilters = useMemo<DataGridActiveFilter[]>(
		() =>
			[
				filters.search
					? {
							key: "search",
							label: `Busqueda: ${filters.search}`,
							onClear: () => actions.setSearch(""),
						}
					: null,
				filters.activeStatus !== "all"
					? {
							key: "activeStatus",
							label: `Estado: ${STATUS_LABEL[filters.activeStatus]}`,
							onClear: () => actions.setActiveStatus("all"),
						}
					: null,
			].filter((value): value is DataGridActiveFilter => value !== null),
		[actions, filters.activeStatus, filters.search]
	)

	return (
		<div id="company-table" className="space-y-3">
			<DataGridToolbar>
				<div className="flex w-full flex-col items-end gap-2 sm:flex-row sm:flex-wrap">
					<SearchInput
						value={filters.search}
						setPage={actions.setPage}
						onChange={actions.setSearch}
						className="w-full lg:w-80"
						inputClassName="h-9 bg-background"
						iconClassName="top-4.5"
						placeholder="Buscar por nombre, RUT o supervisor..."
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
								<DropdownMenuSubTrigger>Estado</DropdownMenuSubTrigger>
								<DropdownMenuSubContent className="w-56">
									<DropdownMenuRadioGroup
										value={filters.activeStatus}
										onValueChange={(value) =>
											actions.setActiveStatus(value as "all" | "active" | "inactive")
										}
									>
										{Object.entries(STATUS_LABEL).map(([value, label]) => (
											<DropdownMenuRadioItem key={value} value={value}>
												{label}
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
							onClick={actions.resetFilters}
							className="size-9 text-blue-600 hover:bg-blue-600 hover:text-white"
						>
							<FilterXIcon className="size-4" />
						</Button>
					</div>
				</div>

				<DataGridActiveFilters filters={activeFilters} />
			</DataGridToolbar>

			<Card>
				<CardContent className="flex w-full flex-col items-start gap-4">
					<DataGrid<Company>
						table={table}
						recordCount={data?.total ?? 0}
						isLoading={isLoading || isFetching}
						emptyMessage="No hay empresas"
						tableLayout={{
							columnsVisibility: true,
							columnsResizable: true,
							columnsPinnable: true,
							width: "fixed",
						}}
					>
						<DataGridContainer border={false} className="w-full overflow-x-auto">
							<DataGridTable<Company> />
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
