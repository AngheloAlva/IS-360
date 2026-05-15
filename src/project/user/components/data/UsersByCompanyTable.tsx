"use client"

import { Columns3Icon, FilterIcon, FilterXIcon } from "lucide-react"
import { useCallback, useMemo, useState } from "react"
import {
	type OnChangeFn,
	type PaginationState,
	type SortingState,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table"

import { getUserByCompanyColumns } from "@/project/user/columns/user-by-company-columns"
import { useUsersByCompany } from "@/project/user/hooks/use-users-by-company"
import { useDebounce } from "@/shared/hooks/useDebounce"

import { DataGridColumnVisibility } from "@/shared/components/data-grid/data-grid-column-visibility"
import { DataGridPagination } from "@/shared/components/data-grid/data-grid-pagination"
import { DataGrid, DataGridContainer } from "@/shared/components/data-grid/data-grid"
import { DataGridTable } from "@/shared/components/data-grid/data-grid-table"
import { Card, CardContent } from "@/shared/components/ui/card"
import RefreshButton from "@/shared/components/RefreshButton"
import SearchInput from "@/shared/components/SearchInput"
import { Button } from "@/shared/components/ui/button"
import {
	DataGridToolbar,
	DataGridActiveFilters,
	type DataGridActiveFilter,
} from "@/shared/components/data-grid/data-grid-toolbar"
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

import type { UsersByCompany } from "@/project/user/hooks/use-users-by-company"

type ActiveStatus = "all" | "active" | "inactive"
type SortBy =
	| "name"
	| "email"
	| "rut"
	| "internalRole"
	| "internalArea"
	| "isSupervisor"
	| "isActive"
	| "createdAt"

const SORTING_COLUMN_TO_API: Record<string, SortBy> = {
	name: "name",
	email: "email",
	rut: "rut",
	internalRole: "internalRole",
	internalArea: "internalArea",
	isSupervisor: "isSupervisor",
	isActive: "isActive",
}

const API_SORT_TO_COLUMN: Partial<Record<SortBy, string>> = {
	name: "name",
	email: "email",
	rut: "rut",
	internalRole: "internalRole",
	internalArea: "internalArea",
	isSupervisor: "isSupervisor",
	isActive: "isActive",
	createdAt: "name",
}

const ACTIVE_STATUS_LABEL: Record<ActiveStatus, string> = {
	all: "Todos",
	active: "Habilitados",
	inactive: "Deshabilitados",
}

export function UsersByCompanyTable({
	companyId,
	showAll = false,
	hasPermission = false,
	showQRActions = false,
}: {
	showAll?: boolean
	companyId: string
	hasPermission?: boolean
	showQRActions?: boolean
}) {
	const [search, setSearch] = useState("")
	const [page, setPage] = useState(1)
	const [pageSize, setPageSize] = useState(15)
	const [sortBy, setSortBy] = useState<SortBy>("createdAt")
	const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
	const [activeStatus, setActiveStatus] = useState<ActiveStatus>(showAll ? "all" : "active")

	const debouncedSearch = useDebounce(search)

	const { data, isLoading, refetch, isFetching } = useUsersByCompany({
		page,
		search: debouncedSearch,
		showAll,
		pageSize,
		companyId,
		activeStatus,
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

	const table = useReactTable<UsersByCompany>({
		data: data?.users ?? [],
		onSortingChange: handleSortingChange,
		getCoreRowModel: getCoreRowModel(),
		columns: getUserByCompanyColumns({ showAll, showReactivate: hasPermission, showQRActions }),
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
				showAll && activeStatus !== "all"
					? {
							key: "activeStatus",
							label: `Estado: ${ACTIVE_STATUS_LABEL[activeStatus]}`,
							onClear: () => setActiveStatus("all"),
						}
					: null,
			].filter((value): value is DataGridActiveFilter => value !== null),
		[activeStatus, search, showAll]
	)

	const resetFilters = () => {
		setSearch("")
		setPage(1)
		setPageSize(15)
		setSortBy("createdAt")
		setSortOrder("desc")
		setActiveStatus(showAll ? "all" : "active")
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
						placeholder="Buscar por nombre, email o RUT..."
					/>

					{showAll && (
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
											value={activeStatus}
											onValueChange={(value) => {
												setActiveStatus(value as ActiveStatus)
												setPage(1)
											}}
										>
											{Object.entries(ACTIVE_STATUS_LABEL).map(([value, label]) => (
												<DropdownMenuRadioItem key={value} value={value}>
													{label}
												</DropdownMenuRadioItem>
											))}
										</DropdownMenuRadioGroup>
									</DropdownMenuSubContent>
								</DropdownMenuSub>
							</DropdownMenuContent>
						</DropdownMenu>
					)}

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
					<DataGrid<UsersByCompany>
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
							<DataGridTable<UsersByCompany> />
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
