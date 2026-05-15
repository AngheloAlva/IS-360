"use client"

import { Columns3Icon, FilterXIcon } from "lucide-react"
import { useCallback, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
	useReactTable,
	getCoreRowModel,
	type OnChangeFn,
	type SortingState,
	type PaginationState,
} from "@tanstack/react-table"

import { getWorkBookColumns } from "../../columns/work-book-columns"
import InitializeWorkBookDialog from "../dialogs/InitializeWorkBookDialog"
import type { WorkBookSchema } from "@/project/work-order/schemas/work-book.schema"
import NewWorkBookFormContent from "@/project/work-order/components/forms/NewWorkBookFormContent"
import {
	WORK_BOOK_SORT_BY,
	useWorkBooksByCompany,
	type WorkBookSortBy,
	type WorkBookByCompany,
	type WorkBooksResponse,
} from "@/project/work-order/hooks/use-work-books-by-company"

import { DataGridColumnVisibility } from "@/shared/components/data-grid/data-grid-column-visibility"
import { DataGridPagination } from "@/shared/components/data-grid/data-grid-pagination"
import { DataGrid, DataGridContainer } from "@/shared/components/data-grid/data-grid"
import { DataGridTable } from "@/shared/components/data-grid/data-grid-table"
import { Card, CardContent } from "@/shared/components/ui/card"
import {
	Dialog,
	DialogTitle,
	DialogHeader,
	DialogContent,
	DialogDescription,
} from "@/shared/components/ui/dialog"
import RefreshButton from "@/shared/components/RefreshButton"
import SearchInput from "@/shared/components/SearchInput"
import { Button } from "@/shared/components/ui/button"
import {
	DataGridActiveFilters,
	DataGridToolbar,
	type DataGridActiveFilter,
} from "@/shared/components/data-grid/data-grid-toolbar"

const SORTING_COLUMN_TO_API: Record<string, WorkBookSortBy> = {
	"otNumber": WORK_BOOK_SORT_BY.OT_NUMBER,
	"supervisor.name": WORK_BOOK_SORT_BY.SUPERVISOR_NAME,
	"responsible.name": WORK_BOOK_SORT_BY.RESPONSIBLE_NAME,
	"workBookName": WORK_BOOK_SORT_BY.WORK_BOOK_NAME,
	"workBookStartDate": WORK_BOOK_SORT_BY.WORK_BOOK_START_DATE,
	"estimatedEndDate": WORK_BOOK_SORT_BY.ESTIMATED_END_DATE,
	"status": WORK_BOOK_SORT_BY.STATUS,
	"progress": WORK_BOOK_SORT_BY.PROGRESS,
	"workBookLocation": WORK_BOOK_SORT_BY.WORK_BOOK_LOCATION,
	"type": WORK_BOOK_SORT_BY.TYPE,
}

const API_SORT_TO_COLUMN: Partial<Record<WorkBookSortBy, string>> = {
	[WORK_BOOK_SORT_BY.OT_NUMBER]: "otNumber",
	[WORK_BOOK_SORT_BY.SUPERVISOR_NAME]: "supervisor.name",
	[WORK_BOOK_SORT_BY.RESPONSIBLE_NAME]: "responsible.name",
	[WORK_BOOK_SORT_BY.WORK_BOOK_NAME]: "workBookName",
	[WORK_BOOK_SORT_BY.WORK_BOOK_START_DATE]: "workBookStartDate",
	[WORK_BOOK_SORT_BY.ESTIMATED_END_DATE]: "estimatedEndDate",
	[WORK_BOOK_SORT_BY.STATUS]: "status",
	[WORK_BOOK_SORT_BY.PROGRESS]: "progress",
	[WORK_BOOK_SORT_BY.WORK_BOOK_LOCATION]: "workBookLocation",
	[WORK_BOOK_SORT_BY.TYPE]: "type",
}

interface WorkBookTableProps {
	companyId?: string
	tutorialData?: WorkBooksResponse
	tutorialMode?: boolean
	tutorialEnableInitializeFlow?: boolean
}

export function WorkBookTable({
	companyId,
	tutorialData,
	tutorialMode = false,
	tutorialEnableInitializeFlow = false,
}: WorkBookTableProps) {
	const [page, setPage] = useState(1)
	const [pageSize, setPageSize] = useState(15)
	const [search, setSearch] = useState("")
	const [sortBy, setSortBy] = useState<WorkBookSortBy>(WORK_BOOK_SORT_BY.CREATED_AT)
	const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
	const [dialogOpen, setDialogOpen] = useState(false)
	const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkBookByCompany | null>(null)
	const [simulatedWorkBooks, setSimulatedWorkBooks] = useState<
		Record<string, { workBookName: string; workBookStartDate: Date }>
	>({})
	const isTutorialMode = tutorialMode && !!tutorialData

	const { data, isLoading, refetch, isFetching } = useWorkBooksByCompany({
		page,
		search,
		limit: pageSize,
		companyId: companyId ?? "tutorial-mode",
		sortBy,
		sortOrder,
		enabled: !isTutorialMode,
	})

	const tableData = useMemo<WorkBooksResponse | undefined>(() => {
		if (!isTutorialMode || !tutorialData) {
			return data
		}

		const mergedRows = tutorialData.workBooks.map((workBook) => {
			const simulated = simulatedWorkBooks[workBook.id]

			if (!simulated) {
				return workBook
			}

			return {
				...workBook,
				workBookName: simulated.workBookName,
				workBookStartDate: simulated.workBookStartDate.toISOString(),
			}
		})

		const normalizedSearch = search.trim().toLowerCase()

		const filteredRows = mergedRows.filter((workBook) => {
			if (!normalizedSearch) {
				return true
			}

			return [
				workBook.otNumber,
				workBook.workBookName ?? "",
				workBook.workBookLocation ?? "",
				workBook.supervisor.name,
				workBook.responsible.name,
			]
				.join(" ")
				.toLowerCase()
				.includes(normalizedSearch)
		})

		const sortedRows = [...filteredRows].sort((a, b) => {
			const resolveStringValue = (workBook: WorkBookByCompany): string => {
				switch (sortBy) {
					case WORK_BOOK_SORT_BY.OT_NUMBER:
						return workBook.otNumber
					case WORK_BOOK_SORT_BY.WORK_BOOK_NAME:
						return workBook.workBookName ?? ""
					case WORK_BOOK_SORT_BY.WORK_BOOK_LOCATION:
						return workBook.workBookLocation ?? ""
					case WORK_BOOK_SORT_BY.SUPERVISOR_NAME:
						return workBook.supervisor.name
					case WORK_BOOK_SORT_BY.RESPONSIBLE_NAME:
						return workBook.responsible.name
					default:
						return ""
				}
			}

			const resolveNumericValue = (workBook: WorkBookByCompany): number => {
				switch (sortBy) {
					case WORK_BOOK_SORT_BY.PROGRESS:
						return workBook.progress ?? 0
					default:
						return 0
				}
			}

			const resolveDateValue = (workBook: WorkBookByCompany): number => {
				switch (sortBy) {
					case WORK_BOOK_SORT_BY.WORK_BOOK_START_DATE:
						return workBook.workBookStartDate ? new Date(workBook.workBookStartDate).getTime() : 0
					case WORK_BOOK_SORT_BY.CREATED_AT:
					default:
						return workBook.solicitationDate.getTime()
				}
			}

			if (sortBy === WORK_BOOK_SORT_BY.PROGRESS) {
				const numericDiff = resolveNumericValue(a) - resolveNumericValue(b)
				return sortOrder === "asc" ? numericDiff : numericDiff * -1
			}

			if (
				sortBy === WORK_BOOK_SORT_BY.WORK_BOOK_START_DATE ||
				sortBy === WORK_BOOK_SORT_BY.CREATED_AT
			) {
				const dateDiff = resolveDateValue(a) - resolveDateValue(b)
				return sortOrder === "asc" ? dateDiff : dateDiff * -1
			}

			const stringDiff = resolveStringValue(a).localeCompare(resolveStringValue(b))
			return sortOrder === "asc" ? stringDiff : stringDiff * -1
		})

		const start = (page - 1) * pageSize
		const paginatedRows = sortedRows.slice(start, start + pageSize)

		return {
			workBooks: paginatedRows,
			total: sortedRows.length,
			pages: Math.max(1, Math.ceil(sortedRows.length / pageSize)),
		}
	}, [
		data,
		isTutorialMode,
		page,
		pageSize,
		search,
		simulatedWorkBooks,
		sortBy,
		sortOrder,
		tutorialData,
	])

	const router = useRouter()

	const handleRowClick = useCallback(
		(workOrder: WorkBookByCompany) => {
			if (isTutorialMode) {
				if (
					tutorialEnableInitializeFlow &&
					(!workOrder.workBookName || !workOrder.workBookStartDate)
				) {
					setSelectedWorkOrder(workOrder)
					setDialogOpen(true)
				}

				return
			}

			if (!workOrder.workBookName || !workOrder.workBookStartDate) {
				setSelectedWorkOrder(workOrder)
				setDialogOpen(true)
			} else {
				router.push(`/dashboard/libro-de-obras/${workOrder.id}`)
			}
		},
		[isTutorialMode, router, tutorialEnableInitializeFlow]
	)

	const sortingState: SortingState = useMemo(() => {
		const columnId = API_SORT_TO_COLUMN[sortBy]
		if (!columnId) {
			return []
		}

		return [{ id: columnId, desc: sortOrder === "desc" }]
	}, [sortBy, sortOrder])

	const columns = useMemo(
		() => getWorkBookColumns({ handleClick: handleRowClick, tutorialMode: isTutorialMode }),
		[handleRowClick, isTutorialMode]
	)

	const handleSortingChange: OnChangeFn<SortingState> = useCallback(
		(updater) => {
			const nextSorting = typeof updater === "function" ? updater(sortingState) : updater
			const firstSort = nextSorting[0]

			if (!firstSort) {
				setSortBy(WORK_BOOK_SORT_BY.CREATED_AT)
				setSortOrder("desc")
				setPage(1)
				return
			}

			setSortBy(SORTING_COLUMN_TO_API[firstSort.id] ?? WORK_BOOK_SORT_BY.CREATED_AT)
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
		data: tableData?.workBooks ?? [],
		columns,
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
		pageCount: tableData?.pages ?? 0,
	})

	const activeFilters = useMemo<DataGridActiveFilter[]>(() => {
		if (!search) {
			return []
		}

		return [
			{
				key: "search",
				label: `Busqueda: ${search}`,
				onClear: () => {
					setSearch("")
					setPage(1)
				},
			},
		]
	}, [search])

	return (
		<div className="space-y-3">
			{isTutorialMode && (
				<div className="rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-800 dark:border-orange-800 dark:bg-orange-950/40 dark:text-orange-100">
					Estas en modo tutorial: toda la informacion es de ejemplo y no modifica datos reales.
				</div>
			)}

			<DataGridToolbar>
				<div className="flex w-full flex-col items-end gap-2 sm:flex-row sm:flex-wrap">
					<div data-tutorial-id="work-book-table-search" className="w-full lg:w-80">
						<SearchInput
							value={search}
							setPage={setPage}
							onChange={setSearch}
							inputClassName="h-9"
							iconClassName="top-4.5"
							className="w-full"
							placeholder="Buscar por numero de OT, obra, ubicacion..."
						/>
					</div>

					<div className="ml-auto flex items-center justify-end gap-2">
						<DataGridColumnVisibility
							table={table}
							trigger={
								<Button size="icon" variant="outline" className="size-10">
									<Columns3Icon className="size-4" />
								</Button>
							}
						/>

						{!isTutorialMode && <RefreshButton refetch={refetch} isFetching={isFetching} />}

						<div data-tutorial-id="work-book-table-reset-filters">
							<Button
								size="icon"
								variant="outline"
								onClick={() => {
									setSearch("")
									setPage(1)
								}}
								className="size-10 text-orange-600 hover:bg-orange-600 hover:text-white"
							>
								<FilterXIcon className="size-4" />
							</Button>
						</div>
					</div>
				</div>

				<DataGridActiveFilters filters={activeFilters} />
			</DataGridToolbar>

			<Card data-tutorial-id="work-book-table-grid">
				<CardContent className="flex w-full flex-col gap-4">
					<DataGrid<WorkBookByCompany>
						table={table}
						recordCount={tableData?.total ?? 0}
						isLoading={isTutorialMode ? false : isLoading || isFetching}
						emptyMessage="No hay libros de obras registrados"
						tableLayout={{
							columnsVisibility: true,
							columnsResizable: true,
							columnsPinnable: true,
							width: "fixed",
						}}
					>
						<DataGridContainer border={false} className="w-full overflow-x-auto">
							<DataGridTable<WorkBookByCompany> />
						</DataGridContainer>
						<DataGridPagination
							rowsPerPageLabel="Filas por pagina"
							previousPageLabel="Pagina anterior"
							nextPageLabel="Pagina siguiente"
							info="{from} - {to} de {count}"
						/>
					</DataGrid>

					{selectedWorkOrder && !isTutorialMode && (
						<InitializeWorkBookDialog
							workOrder={selectedWorkOrder}
							open={dialogOpen}
							onOpenChange={setDialogOpen}
						/>
					)}

					{selectedWorkOrder && isTutorialMode && tutorialEnableInitializeFlow && (
						<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
							<DialogContent className="max-h-[90dvh] overflow-hidden p-0 sm:max-w-xl">
								<DialogHeader className="px-4 pt-4">
									<DialogTitle data-tutorial-id="work-book-init-title">
										Nuevo Libro de Obras
									</DialogTitle>
									<DialogDescription>
										Formulario de entrenamiento con datos precompletados.
									</DialogDescription>
								</DialogHeader>
								<NewWorkBookFormContent
									userId="tutorial-user"
									companyId="tutorial-company"
									onClose={() => setDialogOpen(false)}
									tutorialMode
									tutorialWorkOrders={tutorialData?.workBooks ?? []}
									presetWorkOrderId={selectedWorkOrder.id}
									tutorialDefaultValues={{
										workBookName: "Montaje estructura sector norte - Etapa 1",
										workBookStartDate: new Date(),
									}}
									onTutorialSubmit={(values: WorkBookSchema) => {
										setSimulatedWorkBooks((previous) => ({
											...previous,
											[selectedWorkOrder.id]: {
												workBookName: values.workBookName,
												workBookStartDate: values.workBookStartDate,
											},
										}))
									}}
								/>
							</DialogContent>
						</Dialog>
					)}
				</CardContent>
			</Card>
		</div>
	)
}
