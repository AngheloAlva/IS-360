"use client"

import { Columns3Icon, FilterIcon, FilterXIcon } from "lucide-react"
import { useMemo, useCallback } from "react"
import {
	type OnChangeFn,
	type PaginationState,
	type SortingState,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table"

import { getUserColumns } from "@/project/user/columns/user-columns"
import { UserAreaOptions } from "@/lib/consts/areas"
import { useUserFilters } from "@/project/user/hooks/use-user-filters"

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

import type { ApiUser } from "@/project/user/types/api-user"
import type { OrderBy } from "@/shared/components/OrderByButton"

interface UsersTableProps {
	hasPermission: boolean
	id?: string
}

export function UsersTable({ hasPermission, id }: UsersTableProps) {
	const {
		filters,
		actions,
		users: { data, isLoading, refetch, isFetching },
	} = useUserFilters()

	const columns = useMemo(() => getUserColumns({ hasPermission }), [hasPermission])

	const sortingState: SortingState = filters.orderBy
		? [{ id: filters.orderBy, desc: filters.order === "desc" }]
		: []

	const handleSortingChange: OnChangeFn<SortingState> = useCallback(
		(updater) => {
			const nextSorting = typeof updater === "function" ? updater(sortingState) : updater
			const firstSort = nextSorting[0]

			if (!firstSort) {
				actions.setOrderBy("createdAt")
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

	const table = useReactTable<ApiUser>({
		data: data?.users ?? [],
		columns,
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
				filters.area !== "all"
					? {
							key: "area",
							label: `Area: ${UserAreaOptions.find((area) => area.value === filters.area)?.label ?? filters.area}`,
							onClear: () => actions.setArea("all"),
						}
					: null,
			].filter((value): value is DataGridActiveFilter => value !== null),
		[actions, filters.area, filters.search]
	)

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
						placeholder="Buscar por nombre, email o RUT..."
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
								<DropdownMenuSubTrigger>Area</DropdownMenuSubTrigger>
								<DropdownMenuSubContent className="w-56">
									<DropdownMenuRadioGroup
										value={filters.area}
										onValueChange={(value) => actions.setArea(value)}
									>
										<DropdownMenuRadioItem value="all">Todas las areas</DropdownMenuRadioItem>
										{UserAreaOptions.map((area) => (
											<DropdownMenuRadioItem key={area.value} value={area.value}>
												{area.label}
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
							className="size-9 text-indigo-600 hover:bg-indigo-600 hover:text-white"
						>
							<FilterXIcon className="size-4" />
						</Button>
					</div>
				</div>

				<DataGridActiveFilters filters={activeFilters} />
			</DataGridToolbar>

			<Card>
				<CardContent className="flex w-full flex-col items-start gap-4">
					<DataGrid<ApiUser>
						table={table}
						recordCount={data?.total ?? 0}
						isLoading={isLoading || isFetching}
						emptyMessage="No hay usuarios"
						tableLayout={{
							columnsVisibility: true,
							columnsResizable: true,
							columnsPinnable: true,
							width: "fixed",
						}}
					>
						<DataGridContainer border={false} className="w-full overflow-x-auto">
							<DataGridTable<ApiUser> />
						</DataGridContainer>
						<DataGridPagination
							rowsPerPageLabel="Filas por pagina"
							previousPageLabel="Pagina anterior"
							nextPageLabel="Pagina siguiente"
							info="{from} - {to} de {count}"
							className="border-indigo-600 text-indigo-600 hover:bg-indigo-600"
						/>
					</DataGrid>
				</CardContent>
			</Card>
		</div>
	)
}
