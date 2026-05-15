"use client"

import { Columns3Icon, FileSpreadsheetIcon, FilterIcon, FilterXIcon } from "lucide-react"
import { useCallback, useMemo, useState } from "react"
import {
	getCoreRowModel,
	type OnChangeFn,
	type PaginationState,
	type SortingState,
	useReactTable,
} from "@tanstack/react-table"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { toast } from "sonner"

import { WORK_REQUEST_STATUS } from "@/generated/prisma/enums"
import { updateWorkRequestStatus } from "@/project/work-request/actions/update-work-request-status"
import { updateWorkRequestUrgency } from "@/project/work-request/actions/update-work-request-urgency"
import {
	WORK_REQUEST_SORT_BY,
	type WorkRequest,
	type WorkRequestSortBy,
} from "@/project/work-request/hooks/use-work-request"
import { useWorkRequestFilters } from "@/project/work-request/hooks/use-work-request-filters"
import { getWorkRequestColumns } from "@/project/work-request/columns/work-request-columns"
import { queryClient } from "@/lib/queryClient"

import WorkRequestDetailsDialog from "../dialogs/WorkRequestDetailsDialog"
import { DataGridColumnVisibility } from "@/shared/components/data-grid/data-grid-column-visibility"
import { DataGridPagination } from "@/shared/components/data-grid/data-grid-pagination"
import { DataGrid, DataGridContainer } from "@/shared/components/data-grid/data-grid"
import { DataGridTable } from "@/shared/components/data-grid/data-grid-table"
import {
	DataGridActiveFilters,
	DataGridToolbar,
	type DataGridActiveFilter,
} from "@/shared/components/data-grid/data-grid-toolbar"
import { Card, CardContent } from "@/shared/components/ui/card"
import RefreshButton from "@/shared/components/RefreshButton"
import SearchInput from "@/shared/components/SearchInput"
import { Button } from "@/shared/components/ui/button"
import Spinner from "@/shared/components/Spinner"
import CommentDialog from "../forms/CommentDialog"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"

interface WorkRequestsTableProps {
	id: string
	hasPermission: boolean
}

const SORTING_COLUMN_TO_API: Record<string, WorkRequestSortBy> = {
	requestNumber: WORK_REQUEST_SORT_BY.REQUEST_NUMBER,
	requestDate: WORK_REQUEST_SORT_BY.REQUEST_DATE,
	status: WORK_REQUEST_SORT_BY.STATUS,
	isUrgent: WORK_REQUEST_SORT_BY.IS_URGENT,
	workType: WORK_REQUEST_SORT_BY.WORK_TYPE,
}

const API_SORT_TO_COLUMN: Partial<Record<WorkRequestSortBy, string>> = {
	[WORK_REQUEST_SORT_BY.REQUEST_NUMBER]: "requestNumber",
	[WORK_REQUEST_SORT_BY.REQUEST_DATE]: "requestDate",
	[WORK_REQUEST_SORT_BY.STATUS]: "status",
	[WORK_REQUEST_SORT_BY.IS_URGENT]: "isUrgent",
	[WORK_REQUEST_SORT_BY.WORK_TYPE]: "workType",
	[WORK_REQUEST_SORT_BY.CREATED_AT]: "requestDate",
}

const STATUS_LABEL: Record<string, string> = {
	all: "Todas",
	REPORTED: "Reportada",
	APPROVED: "Aprobada",
	ATTENDED: "Atendida",
	CANCELLED: "Cancelada",
}

export default function WorkRequestsTable({ hasPermission, id }: WorkRequestsTableProps) {
	const [selectedRequest, setSelectedRequest] = useState<WorkRequest | null>(null)
	const [isDetailsOpen, setIsDetailsOpen] = useState(false)
	const [isCommentOpen, setIsCommentOpen] = useState(false)
	const [isStatusLoading, setIsStatusLoading] = useState(false)
	const [exportLoading, setExportLoading] = useState<boolean>(false)

	const {
		filters,
		actions,
		workRequests: { data, refetch, isLoading, isFetching },
	} = useWorkRequestFilters()

	const sortingState: SortingState = API_SORT_TO_COLUMN[filters.sortBy]
		? [{ id: API_SORT_TO_COLUMN[filters.sortBy]!, desc: filters.sortOrder === "desc" }]
		: []

	const handleStatusUpdate = async (id: string, status: WORK_REQUEST_STATUS) => {
		setIsStatusLoading(true)

		try {
			const result = await updateWorkRequestStatus({ id, status })

			if (result.error) {
				toast.error("Error", { description: result.error })
			} else if (result.success) {
				toast.success("Exito", { description: result.success })
    void queryClient.invalidateQueries({ queryKey: ["workRequests"] })
			}
		} catch (err: unknown) {
			console.error("Error al actualizar el estado de la solicitud:", err)
			toast.error("Error", {
				description: "Error al actualizar el estado de la solicitud",
			})
		} finally {
			setIsStatusLoading(false)
		}
	}

	const handleUrgencyUpdate = async (id: string, isUrgent: boolean) => {
		setIsStatusLoading(true)

		try {
			const result = await updateWorkRequestUrgency({ id, isUrgent })

			if (result.error) {
				toast.error("Error", { description: result.error })
			} else if (result.success) {
				toast.success("Exito", { description: result.success })
    void queryClient.invalidateQueries({ queryKey: ["workRequests"] })
			}
		} catch (err: unknown) {
			console.error("Error al actualizar la urgencia de la solicitud:", err)
			toast.error("Error", {
				description: "Error al actualizar la urgencia de la solicitud",
			})
		} finally {
			setIsStatusLoading(false)
		}
	}

	const handleOpenDetails = (request: WorkRequest) => {
		setSelectedRequest(request)
		setIsDetailsOpen(true)
	}

	const handleOpenComment = (request: WorkRequest) => {
		setSelectedRequest(request)
		setIsCommentOpen(true)
	}

	const columns = useMemo(
		() =>
			getWorkRequestColumns({
				hasPermission,
				isStatusLoading,
				handleStatusUpdate,
				handleUrgencyUpdate,
				handleOpenDetails,
				handleOpenComment,
			}),
		[hasPermission, isStatusLoading]
	)

	const handleSortingChange: OnChangeFn<SortingState> = useCallback(
		(updater) => {
			const nextSorting = typeof updater === "function" ? updater(sortingState) : updater
			const firstSort = nextSorting[0]

			if (!firstSort) {
				actions.setSortBy(WORK_REQUEST_SORT_BY.CREATED_AT)
				actions.setSortOrder("desc")
				return
			}

			const sortBy = SORTING_COLUMN_TO_API[firstSort.id] ?? WORK_REQUEST_SORT_BY.CREATED_AT
			actions.setSortBy(sortBy)
			actions.setSortOrder(firstSort.desc ? "desc" : "asc")
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

	const table = useReactTable<WorkRequest>({
		data: data?.workRequests ?? [],
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
		manualPagination: true,
		enableMultiSort: false,
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
				filters.status && filters.status !== "all"
					? {
							key: "status",
							label: `Estado: ${STATUS_LABEL[filters.status] ?? filters.status}`,
							onClear: () => actions.setStatus(null),
						}
					: null,
				filters.isUrgent !== null
					? {
							key: "urgent",
							label: `Urgencia: ${filters.isUrgent ? "Urgente" : "No urgente"}`,
							onClear: () => actions.setIsUrgent(null),
						}
					: null,
			].filter((value): value is DataGridActiveFilter => value !== null),
		[actions, filters.isUrgent, filters.search, filters.status]
	)

	const handleExportToExcel = async () => {
		try {
			setExportLoading(true)

			const searchParams = new URLSearchParams()
			searchParams.set("page", "1")
			searchParams.set("limit", "10000")
			searchParams.set("sortBy", filters.sortBy)
			searchParams.set("sortOrder", filters.sortOrder)

			if (filters.search) searchParams.set("search", filters.search)
			if (filters.status) searchParams.set("status", filters.status)
			searchParams.set("include", "full")
			searchParams.set(
				"isUrgent",
				filters.isUrgent === null ? "all" : filters.isUrgent ? "true" : "false"
			)

			const res: { workRequests: WorkRequest[] } = await fetch(
				`/api/work-request?${searchParams.toString()}`
			).then((response) => response.json())

			if (!res?.workRequests?.length) {
				toast.error("No hay solicitudes de trabajo para exportar")
				return
			}

			const XLSX = await import("xlsx")

			const statusText = (status: WORK_REQUEST_STATUS) => {
				switch (status) {
					case "REPORTED":
						return "Reportada"
					case "APPROVED":
						return "Aprobada"
					case "ATTENDED":
						return "Atendida"
					case "CANCELLED":
						return "Cancelada"
					default:
						return status
				}
			}

			const workbook = XLSX.utils.book_new()
			const worksheet = XLSX.utils.json_to_sheet(
				res.workRequests.map((workRequest) => ({
					"N° Solicitud": workRequest.requestNumber,
					"Solicitante": workRequest.operator?.name || workRequest.user.name,
					"Descripción": workRequest.description,
					"Estado": statusText(workRequest.status),
					"Fecha de solicitud": format(new Date(workRequest.requestDate), "dd/MM/yyyy HH:mm", {
						locale: es,
					}),
					"Urgente": workRequest.isUrgent ? "Si" : "No",
					"Equipos": workRequest.equipments.map((equipment) => equipment.name).join(", "),
					"Observaciones": workRequest.observations,
					"Comentarios": (workRequest.comments ?? []).map((comment) => comment.content).join(", "),
				}))
			)

			XLSX.utils.book_append_sheet(workbook, worksheet, "Solicitudes de Trabajo")
			XLSX.writeFile(workbook, "solicitudes-de-trabajo.xlsx")
			toast.success("Solicitudes de trabajo exportadas exitosamente")
		} catch (error) {
			console.error("[EXPORT_EXCEL]", error)
			toast.error("Error al exportar solicitudes de trabajo")
		} finally {
			setExportLoading(false)
		}
	}

	return (
		<>
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
							placeholder="Buscar por n° solicitud o descripcion..."
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
											value={filters.status ?? "all"}
											onValueChange={(value) => {
												actions.setStatus(value === "all" ? null : value)
											}}
										>
											<DropdownMenuRadioItem value="all">Todas</DropdownMenuRadioItem>
											{Object.values(WORK_REQUEST_STATUS).map((status) => (
												<DropdownMenuRadioItem key={status} value={status}>
													{STATUS_LABEL[status] ?? status}
												</DropdownMenuRadioItem>
											))}
										</DropdownMenuRadioGroup>
									</DropdownMenuSubContent>
								</DropdownMenuSub>

								<DropdownMenuSub>
									<DropdownMenuSubTrigger>Urgencia</DropdownMenuSubTrigger>
									<DropdownMenuSubContent className="w-56">
										<DropdownMenuRadioGroup
											value={
												filters.isUrgent === null ? "all" : filters.isUrgent ? "true" : "false"
											}
											onValueChange={(value) => {
												if (value === "all") {
													actions.setIsUrgent(null)
													return
												}

												actions.setIsUrgent(value === "true")
											}}
										>
											<DropdownMenuRadioItem value="all">Todas</DropdownMenuRadioItem>
											<DropdownMenuRadioItem value="true">Urgente</DropdownMenuRadioItem>
											<DropdownMenuRadioItem value="false">No urgente</DropdownMenuRadioItem>
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
								className="size-9 text-cyan-600 hover:bg-cyan-600 hover:text-white"
							>
								<FilterXIcon className="size-4" />
							</Button>

							<Button
								onClick={handleExportToExcel}
								disabled={isLoading || exportLoading || !data?.workRequests?.length}
								variant="outline"
								size="lg"
								className="text-cyan-600 hover:bg-cyan-600 hover:text-white"
							>
								{exportLoading ? <Spinner /> : <FileSpreadsheetIcon className="h-4 w-4" />}
								Exportar
							</Button>
						</div>
					</div>

					<DataGridActiveFilters filters={activeFilters} />
				</DataGridToolbar>

				<Card>
					<CardContent className="flex w-full flex-col items-start gap-4">
						<DataGrid<WorkRequest>
							table={table}
							recordCount={data?.total ?? 0}
							isLoading={isLoading || isFetching}
							emptyMessage="No hay solicitudes de trabajo"
							tableLayout={{
								columnsVisibility: true,
								columnsResizable: true,
								columnsPinnable: true,
								width: "fixed",
							}}
						>
							<DataGridContainer border={false} className="w-full overflow-x-auto">
								<DataGridTable<WorkRequest> />
							</DataGridContainer>
							<DataGridPagination
								info="{from} - {to} de {count}"
								nextPageLabel="Pagina siguiente"
								rowsPerPageLabel="Filas por pagina"
								previousPageLabel="Pagina anterior"
							/>
						</DataGrid>
					</CardContent>
				</Card>
			</div>

			{selectedRequest && (
				<WorkRequestDetailsDialog
					open={isDetailsOpen}
					workRequestId={selectedRequest.id}
					onOpenChange={setIsDetailsOpen}
				/>
			)}

			{selectedRequest && (
				<CommentDialog
					open={isCommentOpen}
					onOpenChange={setIsCommentOpen}
					workRequestId={selectedRequest.id}
				/>
			)}
		</>
	)
}
