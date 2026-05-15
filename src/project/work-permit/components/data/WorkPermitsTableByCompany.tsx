"use client"

import { Columns3Icon, FilterXIcon } from "lucide-react"
import { useState, useMemo, useCallback } from "react"
import {
	type OnChangeFn,
	type PaginationState,
	type SortingState,
	useReactTable,
	getCoreRowModel,
} from "@tanstack/react-table"

import { getWorkPermitByCompanyColumns } from "../../columns/work-permit-by-company-columns"
import {
	WORK_PERMIT_SORT_BY,
	type WorkPermit,
	type WorkPermitSortBy,
	useWorkPermits,
} from "@/project/work-permit/hooks/use-work-permit"
import { WorkPermitStatusOptions } from "@/lib/consts/work-permit-status"
import { Card, CardContent } from "@/shared/components/ui/card"
import RefreshButton from "@/shared/components/RefreshButton"
import { Button } from "@/shared/components/ui/button"
import { DataGrid, DataGridContainer } from "@/shared/components/data-grid/data-grid"
import { DataGridTable } from "@/shared/components/data-grid/data-grid-table"
import { DataGridPagination } from "@/shared/components/data-grid/data-grid-pagination"
import { DataGridColumnVisibility } from "@/shared/components/data-grid/data-grid-column-visibility"
import SearchInput from "@/shared/components/SearchInput"
import {
	DataGridActiveFilters,
	DataGridToolbar,
	type DataGridActiveFilter,
} from "@/shared/components/data-grid/data-grid-toolbar"
import {
	Select,
	SelectItem,
	SelectLabel,
	SelectValue,
	SelectGroup,
	SelectTrigger,
	SelectContent,
	SelectSeparator,
} from "@/shared/components/ui/select"

const SORTING_COLUMN_TO_API: Record<string, WorkPermitSortBy> = {
	otNumber: WORK_PERMIT_SORT_BY.OT_NUMBER,
	aplicantPt: WORK_PERMIT_SORT_BY.APPLICANT_NAME,
	executanCompany: WORK_PERMIT_SORT_BY.COMPANY_NAME,
	status: WORK_PERMIT_SORT_BY.STATUS,
	exactPlace: WORK_PERMIT_SORT_BY.EXACT_PLACE,
	startDate: WORK_PERMIT_SORT_BY.START_DATE,
	endDate: WORK_PERMIT_SORT_BY.END_DATE,
}

const API_SORT_TO_COLUMN: Partial<Record<WorkPermitSortBy, string>> = {
	[WORK_PERMIT_SORT_BY.OT_NUMBER]: "otNumber",
	[WORK_PERMIT_SORT_BY.APPLICANT_NAME]: "aplicantPt",
	[WORK_PERMIT_SORT_BY.COMPANY_NAME]: "executanCompany",
	[WORK_PERMIT_SORT_BY.STATUS]: "status",
	[WORK_PERMIT_SORT_BY.EXACT_PLACE]: "exactPlace",
	[WORK_PERMIT_SORT_BY.START_DATE]: "startDate",
	[WORK_PERMIT_SORT_BY.END_DATE]: "endDate",
}

export function WorkPermitsTableByCompany({ companyId }: { companyId: string }) {
	const [statusFilter, setStatusFilter] = useState<string | null>(null)
	const [search, setSearch] = useState("")
	const [page, setPage] = useState(1)
	const [pageSize, setPageSize] = useState(15)
	const [sortBy, setSortBy] = useState<WorkPermitSortBy>(WORK_PERMIT_SORT_BY.CREATED_AT)
	const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

	const { data, isLoading, refetch, isFetching } = useWorkPermits({
		page,
		search,
		limit: pageSize,
		companyId,
		statusFilter,
		dateRange: null,
		approvedBy: null,
		typeFilter: null,
		hasLockoutPermit: null,
		sortBy,
		sortOrder,
	})

	const sortingState: SortingState = useMemo(() => {
		const columnId = API_SORT_TO_COLUMN[sortBy]
		if (!columnId) {
			return []
		}

		return [{ id: columnId, desc: sortOrder === "desc" }]
	}, [sortBy, sortOrder])

	const handleSortingChange: OnChangeFn<SortingState> = useCallback(
		(updater) => {
			const nextSorting = typeof updater === "function" ? updater(sortingState) : updater
			const firstSort = nextSorting[0]

			if (!firstSort) {
				setSortBy(WORK_PERMIT_SORT_BY.CREATED_AT)
				setSortOrder("desc")
				setPage(1)
				return
			}

			setSortBy(SORTING_COLUMN_TO_API[firstSort.id] ?? WORK_PERMIT_SORT_BY.CREATED_AT)
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
				return
			}

			if (nextPagination.pageIndex !== currentPagination.pageIndex) {
				setPage(nextPagination.pageIndex + 1)
			}
		},
		[page, pageSize]
	)

	const table = useReactTable({
		data: data?.workPermits ?? [],
		columns: getWorkPermitByCompanyColumns(),
		getCoreRowModel: getCoreRowModel(),
		state: {
			sorting: sortingState,
			pagination: {
				pageIndex: page - 1,
				pageSize,
			},
		},
		onSortingChange: handleSortingChange,
		onPaginationChange: handlePaginationChange,
		manualSorting: true,
		manualPagination: true,
		enableMultiSort: false,
		enableColumnPinning: true,
		columnResizeMode: "onChange",
		pageCount: data?.pages ?? 0,
	})

	const activeFilters: DataGridActiveFilter[] = [
		...(search
			? [
					{
						key: "search",
						label: `Busqueda: ${search}`,
						onClear: () => {
							setSearch("")
							setPage(1)
						},
					},
				]
			: []),
		...(statusFilter
			? [
					{
						key: "status",
						label: `Estado: ${WorkPermitStatusOptions.find((status) => status.value === statusFilter)?.label ?? statusFilter}`,
						onClear: () => {
							setStatusFilter(null)
							setPage(1)
						},
					},
				]
			: []),
	]

	return (
		<div className="space-y-3">
			<DataGridToolbar>
				<div className="flex w-full flex-wrap items-end justify-start gap-2 md:w-full md:flex-row">
					<SearchInput
						value={search}
						setPage={setPage}
						onChange={setSearch}
						iconClassName="top-4.5"
						inputClassName="w-80 h-9"
						placeholder="Buscar por número de OT, trabajo, ubicación..."
					/>

					<Select
						onValueChange={(value) => {
							if (value === "all") {
								setStatusFilter(null)
							} else {
								setStatusFilter(value)
							}
							setPage(1)
						}}
						value={statusFilter ?? "all"}
					>
						<SelectTrigger className="border-input bg-background h-9! w-full border sm:w-fit">
							<SelectValue placeholder="Estado" />
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								<SelectLabel>Estado</SelectLabel>
								<SelectSeparator />
								<SelectItem value="all">Todos los estados</SelectItem>
								{WorkPermitStatusOptions.map((status) => (
									<SelectItem key={status.value} value={status.value}>
										{status.label}
									</SelectItem>
								))}
							</SelectGroup>
						</SelectContent>
					</Select>

					<DataGridColumnVisibility
						table={table}
						trigger={
							<Button
								size="lg"
								className="text-text border-input hover:bg-input bg-background ml-auto size-10 border"
							>
								<Columns3Icon />
							</Button>
						}
					/>

					<Button
						size="icon"
						variant="outline"
						onClick={() => {
							setSearch("")
							setStatusFilter(null)
							setPage(1)
						}}
						className="size-10 text-cyan-600 hover:bg-cyan-600 hover:text-white"
					>
						<FilterXIcon className="size-4" />
					</Button>

					<RefreshButton refetch={() => refetch()} isFetching={isFetching} />
				</div>

				<DataGridActiveFilters filters={activeFilters} />
			</DataGridToolbar>

			<Card>
				<CardContent className="flex w-full flex-col items-start gap-2">
					<DataGrid<WorkPermit>
						table={table}
						recordCount={data?.total ?? 0}
						isLoading={isLoading || isFetching}
						emptyMessage="No hay permisos de trabajo"
						tableLayout={{
							columnsVisibility: true,
							columnsResizable: true,
							columnsPinnable: true,
							width: "fixed",
						}}
					>
						<DataGridContainer border={false} className="w-full overflow-x-auto">
							<DataGridTable<WorkPermit> />
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
