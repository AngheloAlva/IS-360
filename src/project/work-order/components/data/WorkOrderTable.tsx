"use client"

import { Columns3Icon, FileSpreadsheetIcon, FilterIcon, FilterXIcon, X } from "lucide-react"
import { useCallback, useMemo, useState } from "react"
import { es } from "date-fns/locale"
import { format } from "date-fns"
import { toast } from "sonner"
import {
	useReactTable,
	getCoreRowModel,
	type OnChangeFn,
	type SortingState,
	type PaginationState,
} from "@tanstack/react-table"

import { WORK_ORDER_PRIORITY, WORK_ORDER_STATUS, WORK_ORDER_TYPE } from "@/generated/prisma/enums"
import { useWorkOrderFilters } from "@/project/work-order/hooks/use-work-order-filters"
import { useWorkOrderSelectionStore } from "../../stores/work-order-selection-store"
import { WorkOrderPriorityLabels } from "@/lib/consts/work-order-priority"
import { getWorkOrderColumns } from "../../columns/work-order-columns"
import { WorkOrderStatusLabels } from "@/lib/consts/work-order-status"
import { WorkOrderTypeLabels } from "@/lib/consts/work-order-types"
import {
	type WorkOrder,
	WORK_ORDER_SORT_BY,
	type WorkOrderSortBy,
} from "../../hooks/use-work-order"
import { useCompanies } from "@/project/company/hooks/use-companies"
import { useUsers } from "@/project/user/hooks/use-users"

import { DataGridColumnVisibility } from "@/shared/components/data-grid/data-grid-column-visibility"
import { DataGridPagination } from "@/shared/components/data-grid/data-grid-pagination"
import { DataGrid, DataGridContainer } from "@/shared/components/data-grid/data-grid"
import { CalendarDateRangePicker } from "@/shared/components/ui/date-range-picker"
import { DataGridTable } from "@/shared/components/data-grid/data-grid-table"
import BulkCloseWorkOrdersDialog from "../dialogs/BulkCloseWorkOrdersDialog"
import WorkOrderDetailsDialog from "../dialogs/WorkOrderDetailsDialog"
import { Card, CardContent } from "@/shared/components/ui/card"
import RefreshButton from "@/shared/components/RefreshButton"
import SearchInput from "@/shared/components/SearchInput"
import { Button } from "@/shared/components/ui/button"
import Spinner from "@/shared/components/Spinner"
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
	DropdownMenuSubContent,
	DropdownMenuRadioGroup,
	DropdownMenuSubTrigger,
} from "@/shared/components/ui/dropdown-menu"

import type { WorkOrdersWithInspectionsResponse } from "@/app/api/work-order/with-inspections/route"

interface WorkOrderTableProps {
	id?: string
	canDelete?: boolean
	isInternalMember?: boolean
}

const SORTING_COLUMN_TO_API: Record<string, WorkOrderSortBy> = {
	otNumber: WORK_ORDER_SORT_BY.OT_NUMBER,
	company: WORK_ORDER_SORT_BY.COMPANY_NAME,
	supervisor: WORK_ORDER_SORT_BY.SUPERVISOR_NAME,
	workRequest: WORK_ORDER_SORT_BY.WORK_REQUEST,
	progress: WORK_ORDER_SORT_BY.PROGRESS,
	status: WORK_ORDER_SORT_BY.STATUS,
	solicitationDate: WORK_ORDER_SORT_BY.SOLICITATION_DATE,
	type: WORK_ORDER_SORT_BY.TYPE,
	priority: WORK_ORDER_SORT_BY.PRIORITY,
	programDate: WORK_ORDER_SORT_BY.PROGRAM_DATE,
}

const API_SORT_TO_COLUMN: Partial<Record<WorkOrderSortBy, string>> = {
	[WORK_ORDER_SORT_BY.OT_NUMBER]: "otNumber",
	[WORK_ORDER_SORT_BY.COMPANY_NAME]: "company",
	[WORK_ORDER_SORT_BY.SUPERVISOR_NAME]: "supervisor",
	[WORK_ORDER_SORT_BY.WORK_REQUEST]: "workRequest",
	[WORK_ORDER_SORT_BY.PROGRESS]: "progress",
	[WORK_ORDER_SORT_BY.STATUS]: "status",
	[WORK_ORDER_SORT_BY.SOLICITATION_DATE]: "solicitationDate",
	[WORK_ORDER_SORT_BY.TYPE]: "type",
	[WORK_ORDER_SORT_BY.PRIORITY]: "priority",
	[WORK_ORDER_SORT_BY.PROGRAM_DATE]: "programDate",
}

export function WorkOrderTable({
	id,
	canDelete = false,
	isInternalMember = false,
}: WorkOrderTableProps) {
	const [exportInspectionsLoading, setExportInspectionsLoading] = useState<boolean>(false)
	const [dialogDetailsOpen, setDialogDetailsOpen] = useState<boolean>(false)
	const [exportLoading, setExportLoading] = useState<boolean>(false)
	const [selectedId, setSelectedId] = useState<string | null>(null)

	const { selectedIds, getSelectedCount, clearSelection } = useWorkOrderSelectionStore()
	const { filters, actions, workOrders } = useWorkOrderFilters()
	const { data, isLoading, refetch, isFetching } = workOrders

	const { data: companies } = useCompanies({
		limit: 1000,
	})

	const { data: responsibleUsersData } = useUsers({ limit: 1000, search: "demo" })

	const sortingState: SortingState = API_SORT_TO_COLUMN[filters.sortBy]
		? [{ id: API_SORT_TO_COLUMN[filters.sortBy]!, desc: filters.sortOrder === "desc" }]
		: []

	const columns = useMemo(
		() => getWorkOrderColumns({ setSelectedId, setDialogDetailsOpen, isInternalMember, canDelete }),
		[isInternalMember, canDelete]
	)

	const companyName = useMemo(
		() => companies?.companies?.find((company) => company.id === filters.companyId)?.name ?? null,
		[companies?.companies, filters.companyId]
	)

	const responsibleName = useMemo(
		() =>
			responsibleUsersData?.users?.find((user) => user.id === filters.responsibleId)?.name ?? null,
		[responsibleUsersData?.users, filters.responsibleId]
	)

	const statusLabel = useMemo(
		() =>
			filters.statusFilter
				? WorkOrderStatusLabels[filters.statusFilter as keyof typeof WorkOrderStatusLabels]
				: null,
		[filters.statusFilter]
	)

	const typeLabel = useMemo(
		() =>
			filters.typeFilter
				? WorkOrderTypeLabels[filters.typeFilter as keyof typeof WorkOrderTypeLabels]
				: null,
		[filters.typeFilter]
	)

	const priorityLabel = useMemo(
		() =>
			filters.priorityFilter
				? WorkOrderPriorityLabels[filters.priorityFilter as keyof typeof WorkOrderPriorityLabels]
				: null,
		[filters.priorityFilter]
	)

	const handleExportToExcel = useCallback(async () => {
		try {
			setExportLoading(true)

			const searchParams = new URLSearchParams()
			searchParams.set("page", "1")
			searchParams.set("limit", "10000")
			searchParams.set("includeEquipments", "true")
			searchParams.set("sortBy", filters.sortBy)
			searchParams.set("sortOrder", filters.sortOrder)

			if (filters.search) searchParams.set("search", filters.search)
			if (filters.companyId) searchParams.set("companyId", filters.companyId)
			if (filters.responsibleId) searchParams.set("responsibleId", filters.responsibleId)
			if (filters.typeFilter) searchParams.set("typeFilter", filters.typeFilter)
			if (filters.statusFilter) searchParams.set("statusFilter", filters.statusFilter)
			if (filters.priorityFilter) searchParams.set("priorityFilter", filters.priorityFilter)
			if (filters.onlyWithRequestClousure) searchParams.set("onlyWithRequestClousure", "true")
			if (filters.dateRange?.from)
				searchParams.set("startDate", filters.dateRange.from.toISOString())
			if (filters.dateRange?.to) searchParams.set("endDate", filters.dateRange.to.toISOString())

			const res: { workOrders: WorkOrder[] } = await fetch(
				`/api/work-order?${searchParams.toString()}`
			).then((res) => res.json())

			if (!res?.workOrders?.length) {
				toast.error("No hay ordenes de trabajo para exportar")
				return
			}

			const XLSX = await import("xlsx")

			const workbook = XLSX.utils.book_new()
			const worksheet = XLSX.utils.json_to_sheet(
				res?.workOrders.map((workOrder: WorkOrder) => ({
					"No. OT": workOrder.otNumber,
					"Fecha de solicitud": workOrder.solicitationDate,
					"Tipo": WorkOrderTypeLabels[workOrder.type],
					"Estado": WorkOrderStatusLabels[workOrder.status],
					"Trabajo": workOrder.workRequest,
					"Prioridad": WorkOrderPriorityLabels[workOrder.priority],
					"Porcentaje de avance": workOrder.progress,
					"Fecha programada": format(workOrder.programDate, "dd/MM/yyyy", { locale: es }),
					"Fecha estimada de finalizacion": workOrder.estimatedEndDate
						? format(workOrder.estimatedEndDate, "dd/MM/yyyy", { locale: es })
						: "N/A",
					"Empresa": workOrder.company?.name,
					"Supervisor": `${workOrder.supervisor?.name} ${workOrder.supervisor?.email}`,
					"Equipos": workOrder.equipments?.map((equipment) => equipment.name).join(", "),
					"Cantidad de actividades": workOrder._count.workBookEntries,
				}))
			)

			XLSX.utils.book_append_sheet(workbook, worksheet, "Ordenes de Trabajo")
			XLSX.writeFile(workbook, "ordenes-de-trabajo.xlsx")
			toast.success("Ordenes de trabajo exportadas exitosamente")
		} catch (error) {
			console.error("[EXPORT_EXCEL]", error)
			toast.error("Error al exportar ordenes de trabajo")
		} finally {
			setExportLoading(false)
		}
	}, [filters])

	const handleExportInspectionsToExcel = useCallback(async () => {
		try {
			setExportInspectionsLoading(true)

			const res: WorkOrdersWithInspectionsResponse = await fetch(
				`/api/work-order/with-inspections`
			).then((res) => res.json())

			if (!res?.formattedData?.length) {
				toast.error("No hay inspecciones internas para exportar")
				return
			}

			const XLSX = await import("xlsx")
			const workbook = XLSX.utils.book_new()

			const summaryData = res.workOrders.map((wo) => ({
				"No. OT": wo.otNumber,
				"Nombre OT": wo.workBookName,
				"Trabajo Solicitado": wo.workRequest,
				"Estado": WorkOrderStatusLabels[wo.status as keyof typeof WorkOrderStatusLabels],
				"Tipo": WorkOrderTypeLabels[wo.type as keyof typeof WorkOrderTypeLabels],
				"Prioridad": WorkOrderPriorityLabels[wo.priority as keyof typeof WorkOrderPriorityLabels],
				"Progreso (%)": wo.progress,
				"Empresa": wo.company?.name,
				"RUT Empresa": wo.company?.rut,
				"Supervisor": wo.supervisor?.name,
				"Email Supervisor": wo.supervisor?.email,
				"Telefono Supervisor": wo.supervisor?.phone || "N/A",
				"Total Inspecciones": wo._count.workBookEntries,
				"Fecha Solicitud": format(new Date(wo.solicitationDate), "dd/MM/yyyy", { locale: es }),
				"Fecha Programada": format(new Date(wo.programDate), "dd/MM/yyyy", { locale: es }),
				"Fecha Est. Finalizacion": wo.estimatedEndDate
					? format(new Date(wo.estimatedEndDate), "dd/MM/yyyy", { locale: es })
					: "N/A",
			}))

			XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(summaryData), "Resumen OTs")

			const inspectionsData = res.formattedData.map((item) => ({
				"No. OT": item.workOrder.otNumber,
				"Nombre OT": item.workOrder.workBookName,
				"Empresa": item.workOrder.company?.name,
				"Supervisor OT": item.workOrder.supervisor?.name,
				"No. Inspeccion": item.inspection.inspectionNumber,
				"Fecha Ejecucion": format(new Date(item.inspection.executionDate), "dd/MM/yyyy HH:mm", {
					locale: es,
				}),
				"Estado Inspeccion":
					item.inspection.inspectionStatus === "REPORTED" ? "Reportado" : "Resuelto",
				"Inspector": item.inspection.createdBy?.name,
				"Email Inspector": item.inspection.createdBy?.email,
				"Comentarios": item.inspection.comments || "N/A",
				"Observaciones de Seguridad": item.inspection.safetyObservations || "N/A",
				"No Conformidades": item.inspection.nonConformities || "N/A",
				"Comentarios de Supervision": item.inspection.supervisionComments || "N/A",
				"Cantidad de Respuestas": item.inspection.inspectionComments?.length || 0,
				"Fecha Creacion": format(new Date(item.inspection.createdAt), "dd/MM/yyyy HH:mm", {
					locale: es,
				}),
			}))

			XLSX.utils.book_append_sheet(
				workbook,
				XLSX.utils.json_to_sheet(inspectionsData),
				"Detalle Inspecciones"
			)

			const commentsData: Array<{
				"No. OT": string
				"No. Inspeccion": number
				"Tipo Comentario": string
				"Usuario": string
				"Email": string
				"Comentario": string
				"Fecha": string
			}> = []

			res.formattedData.forEach((item) => {
				item.inspection.inspectionComments?.forEach((comment) => {
					commentsData.push({
						"No. OT": item.workOrder.otNumber,
						"No. Inspeccion": item.inspection.inspectionNumber,
						"Tipo Comentario":
							comment.type === "SUPERVISOR_RESPONSE"
								? "Respuesta Supervisor"
								: comment.type === "RESPONSIBLE_APPROVAL"
									? "Aprobacion Responsable"
									: "Rechazo Responsable",
						"Usuario": comment.author?.name,
						"Email": comment.author?.email,
						"Comentario": comment.content || "N/A",
						"Fecha": format(new Date(comment.createdAt), "dd/MM/yyyy HH:mm", { locale: es }),
					})
				})
			})

			if (commentsData.length > 0) {
				XLSX.utils.book_append_sheet(
					workbook,
					XLSX.utils.json_to_sheet(commentsData),
					"Comentarios"
				)
			}

			const fileName = `inspecciones-internas-${format(new Date(), "dd-MM-yyyy")}.xlsx`
			XLSX.writeFile(workbook, fileName)
			toast.success(
				`Exportadas ${res.total} OTs con ${res.totalInspections} inspecciones exitosamente`
			)
		} catch (error) {
			console.error("[EXPORT_INSPECTIONS_EXCEL]", error)
			toast.error("Error al exportar inspecciones internas")
		} finally {
			setExportInspectionsLoading(false)
		}
	}, [])

	const handleSortingChange: OnChangeFn<SortingState> = useCallback(
		(updater) => {
			const nextSorting = typeof updater === "function" ? updater(sortingState) : updater
			const firstSort = nextSorting[0]

			if (!firstSort) {
				actions.setSortBy(WORK_ORDER_SORT_BY.CREATED_AT)
				actions.setSortOrder("desc")
				return
			}

			const sortBy = SORTING_COLUMN_TO_API[firstSort.id] ?? WORK_ORDER_SORT_BY.CREATED_AT
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

	const table = useReactTable<WorkOrder>({
		data: data?.workOrders ?? [],
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

	const selectedCount = getSelectedCount()

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
				companyName
					? {
							key: "company",
							label: `Empresa: ${companyName}`,
							onClear: () => actions.setCompanyId(null),
						}
					: null,
				responsibleName
					? {
							key: "responsible",
							label: `Responsable: ${responsibleName}`,
							onClear: () => actions.setResponsibleId(null),
						}
					: null,
				statusLabel
					? {
							key: "status",
							label: `Estado: ${statusLabel}`,
							onClear: () => actions.setStatusFilter(null),
						}
					: null,
				typeLabel
					? {
							key: "type",
							label: `Tipo: ${typeLabel}`,
							onClear: () => actions.setTypeFilter(null),
						}
					: null,
				priorityLabel
					? {
							key: "priority",
							label: `Prioridad: ${priorityLabel}`,
							onClear: () => actions.setPriorityFilter(null),
						}
					: null,
				filters.onlyWithRequestClousure
					? {
							key: "closure",
							label: "Con solicitud de cierre",
							onClear: () => actions.setOnlyWithRequestClousure(false),
						}
					: null,
				filters.dateRange?.from
					? {
							key: "dateRange",
							label: `Fecha: ${format(filters.dateRange.from, "dd/MM/yyyy")}${filters.dateRange.to ? ` - ${format(filters.dateRange.to, "dd/MM/yyyy")}` : ""}`,
							onClear: () => actions.setDateRange(null),
						}
					: null,
			].filter((value): value is DataGridActiveFilter => value !== null),
		[
			actions,
			companyName,
			responsibleName,
			filters.dateRange,
			filters.onlyWithRequestClousure,
			filters.search,
			priorityLabel,
			statusLabel,
			typeLabel,
		]
	)

	return (
		<div id={id} className="space-y-3">
			<DataGridToolbar>
				<div className="flex w-full flex-col items-end gap-2 sm:flex-row sm:flex-wrap">
					<SearchInput
						inputClassName="h-9"
						value={filters.search}
						iconClassName="top-4.5"
						setPage={actions.setPage}
						className="w-full lg:w-80"
						onChange={actions.setSearch}
						placeholder="Buscar por no OT, trabajo..."
					/>

					<CalendarDateRangePicker value={filters.dateRange} onChange={actions.setDateRange} />

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
								<DropdownMenuSubTrigger>Empresa</DropdownMenuSubTrigger>
								<DropdownMenuSubContent className="max-h-72 w-64 overflow-y-auto">
									<DropdownMenuRadioGroup
										value={filters.companyId ?? "all"}
										onValueChange={(value) => actions.setCompanyId(value === "all" ? null : value)}
									>
										<DropdownMenuRadioItem value="all">Todas las empresas</DropdownMenuRadioItem>
										{companies?.companies?.map((company) => (
											<DropdownMenuRadioItem key={company.id} value={company.id}>
												{company.name}
											</DropdownMenuRadioItem>
										))}
									</DropdownMenuRadioGroup>
								</DropdownMenuSubContent>
							</DropdownMenuSub>

							<DropdownMenuSub>
								<DropdownMenuSubTrigger>Responsable</DropdownMenuSubTrigger>
								<DropdownMenuSubContent className="max-h-72 w-64 overflow-y-auto">
									<DropdownMenuRadioGroup
										value={filters.responsibleId ?? "all"}
										onValueChange={(value) =>
											actions.setResponsibleId(value === "all" ? null : value)
										}
									>
										<DropdownMenuRadioItem value="all">
											Todos los responsables
										</DropdownMenuRadioItem>
										{responsibleUsersData?.users?.map((user) => (
											<DropdownMenuRadioItem key={user.id} value={user.id}>
												{user.name}
											</DropdownMenuRadioItem>
										))}
									</DropdownMenuRadioGroup>
								</DropdownMenuSubContent>
							</DropdownMenuSub>

							<DropdownMenuSub>
								<DropdownMenuSubTrigger>Estado</DropdownMenuSubTrigger>
								<DropdownMenuSubContent className="w-56">
									<DropdownMenuRadioGroup
										value={filters.statusFilter ?? "all"}
										onValueChange={(value) =>
											actions.setStatusFilter(value === "all" ? null : value)
										}
									>
										<DropdownMenuRadioItem value="all">Todos los estados</DropdownMenuRadioItem>
										{Object.values(WORK_ORDER_STATUS).map((status) => (
											<DropdownMenuRadioItem key={status} value={status}>
												{WorkOrderStatusLabels[status]}
											</DropdownMenuRadioItem>
										))}
									</DropdownMenuRadioGroup>
								</DropdownMenuSubContent>
							</DropdownMenuSub>

							<DropdownMenuSub>
								<DropdownMenuSubTrigger>Tipo de obra</DropdownMenuSubTrigger>
								<DropdownMenuSubContent className="w-56">
									<DropdownMenuRadioGroup
										value={filters.typeFilter ?? "all"}
										onValueChange={(value) => actions.setTypeFilter(value === "all" ? null : value)}
									>
										<DropdownMenuRadioItem value="all">Todos los tipos</DropdownMenuRadioItem>
										{Object.values(WORK_ORDER_TYPE).map((type) => (
											<DropdownMenuRadioItem key={type} value={type}>
												{WorkOrderTypeLabels[type]}
											</DropdownMenuRadioItem>
										))}
									</DropdownMenuRadioGroup>
								</DropdownMenuSubContent>
							</DropdownMenuSub>

							<DropdownMenuSub>
								<DropdownMenuSubTrigger>Prioridad</DropdownMenuSubTrigger>
								<DropdownMenuSubContent className="w-56">
									<DropdownMenuRadioGroup
										value={filters.priorityFilter ?? "all"}
										onValueChange={(value) =>
											actions.setPriorityFilter(value === "all" ? null : value)
										}
									>
										<DropdownMenuRadioItem value="all">Todas las prioridades</DropdownMenuRadioItem>
										{Object.values(WORK_ORDER_PRIORITY).map((priority) => (
											<DropdownMenuRadioItem key={priority} value={priority}>
												{WorkOrderPriorityLabels[priority]}
											</DropdownMenuRadioItem>
										))}
									</DropdownMenuRadioGroup>
								</DropdownMenuSubContent>
							</DropdownMenuSub>

							<DropdownMenuSub>
								<DropdownMenuSubTrigger>Cierre</DropdownMenuSubTrigger>
								<DropdownMenuSubContent className="w-56">
									<DropdownMenuRadioGroup
										value={filters.onlyWithRequestClousure ? "true" : "all"}
										onValueChange={(value) => actions.setOnlyWithRequestClousure(value === "true")}
									>
										<DropdownMenuRadioItem value="all">Todos</DropdownMenuRadioItem>
										<DropdownMenuRadioItem value="true">
											Con solicitud de cierre
										</DropdownMenuRadioItem>
									</DropdownMenuRadioGroup>
								</DropdownMenuSubContent>
							</DropdownMenuSub>
						</DropdownMenuContent>
					</DropdownMenu>

					<div className="ml-auto flex items-center justify-end gap-2">
						<RefreshButton size="md" refetch={refetch} isFetching={isFetching} />

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
							className="size-9 text-orange-600 hover:bg-orange-600 hover:text-white"
						>
							<FilterXIcon className="size-4" />
						</Button>

						<Button
							size="lg"
							variant={"outline"}
							onClick={handleExportToExcel}
							className="text-green-600 hover:bg-green-700"
						>
							{exportLoading ? <Spinner /> : <FileSpreadsheetIcon className="h-4 w-4" />}
							Exportar
						</Button>

						<Button
							size="lg"
							variant="outline"
							onClick={handleExportInspectionsToExcel}
							className="text-green-600 hover:bg-green-600 hover:text-white"
						>
							{exportInspectionsLoading ? <Spinner /> : <FileSpreadsheetIcon className="h-4 w-4" />}
							Exportar inspecciones
						</Button>
					</div>
				</div>

				<div className="flex items-center justify-between gap-4">
					<DataGridActiveFilters filters={activeFilters} />

					{selectedCount > 0 && (
						<div className="ml-auto flex items-center gap-2">
							<Button size={"sm"} variant="outline" onClick={clearSelection} className="ml-auto">
								<X className="h-4 w-4" />
								Limpiar ({selectedCount})
							</Button>

							<BulkCloseWorkOrdersDialog
								workOrders={selectedIds}
								onSuccess={() => {
         void refetch()
									clearSelection()
									toast.success("Órdenes de trabajo cerradas exitosamente")
								}}
							/>
						</div>
					)}
				</div>
			</DataGridToolbar>

			<Card>
				<CardContent className="flex w-full flex-col items-start gap-4">
					<DataGrid<WorkOrder>
						table={table}
						recordCount={data?.total ?? 0}
						isLoading={isLoading || isFetching}
						emptyMessage="No se encontraron resultados."
						tableLayout={{
							columnsVisibility: true,
							columnsResizable: true,
							columnsPinnable: true,
							width: "fixed",
						}}
					>
						<DataGridContainer border={false} className="w-full overflow-x-auto">
							<DataGridTable<WorkOrder> />
						</DataGridContainer>
						<DataGridPagination
							rowsPerPageLabel="Filas por pagina"
							previousPageLabel="Pagina anterior"
							nextPageLabel="Pagina siguiente"
							info="{from} - {to} de {count}"
						/>
					</DataGrid>

					{selectedId && (
						<WorkOrderDetailsDialog
							workOrderId={selectedId}
							open={dialogDetailsOpen}
							setOpen={setDialogDetailsOpen}
						/>
					)}
				</CardContent>
			</Card>
		</div>
	)
}
