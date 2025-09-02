"use client"

import { FileSpreadsheetIcon, FilterIcon, FilterXIcon, InfoIcon, X } from "lucide-react"
import { useCallback, useMemo, useState, useRef, lazy, Suspense } from "react"
import { es } from "date-fns/locale"
import { format } from "date-fns"
import { toast } from "sonner"
import {
	flexRender,
	useReactTable,
	getCoreRowModel,
	getFilteredRowModel,
} from "@tanstack/react-table"

import { fetchWorkBookMilestones } from "@/project/work-order/hooks/use-work-book-milestones"
import { useWorkOrderFilters } from "@/project/work-order/hooks/use-work-order-filters"
import { fetchWorkBookById } from "@/project/work-order/hooks/use-work-book-by-id"
import { useWorkOrderSelectionStore } from "../../stores/work-order-selection-store"
import { WorkOrderPriorityLabels } from "@/lib/consts/work-order-priority"
import { getWorkOrderColumns } from "../../columns/work-order-columns"
import { WorkOrderTypeLabels } from "@/lib/consts/work-order-types"
import { queryClient } from "@/lib/queryClient"

import { CalendarDateRangePicker } from "@/shared/components/ui/date-range-picker"
import { CompanyFilterLoadingSkeleton } from "./WorkOrderCompanyFilterWithData"
import BulkCloseWorkOrdersDialog from "../dialogs/BulkCloseWorkOrdersDialog"
import { TablePagination } from "@/shared/components/ui/table-pagination"
import { WorkOrderStatusLabels } from "@/lib/consts/work-order-status"
import WorkOrderDetailsDialog from "../dialogs/WorkOrderDetailsDialog"
import { Card, CardContent } from "@/shared/components/ui/card"
import OrderByButton from "@/shared/components/OrderByButton"
import RefreshButton from "@/shared/components/RefreshButton"
import { Skeleton } from "@/shared/components/ui/skeleton"
import SearchInput from "@/shared/components/SearchInput"
import { Button } from "@/shared/components/ui/button"
import Spinner from "@/shared/components/Spinner"
import {
	Table,
	TableRow,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
} from "@/shared/components/ui/table"
import {
	DropdownMenu,
	DropdownMenuItem,
	DropdownMenuGroup,
	DropdownMenuLabel,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"
import {
	WorkOrderTypeFilter,
	WorkOrderStatusFilter,
	WorkOrderPriorityFilter,
	WorkOrderHasRequestClousureFilter,
} from "./WorkOrderFilters"

import type { WorkOrder } from "@/project/work-order/hooks/use-work-order"

const WorkOrderCompanyFilterWithData = lazy(() => import("./WorkOrderCompanyFilterWithData"))

interface WorkOrderTableProps {
	id?: string
	isOtcMember?: boolean
}

export function WorkOrderTable({ id, isOtcMember = false }: WorkOrderTableProps) {
	const [dialogDetailsOpen, setDialogDetailsOpen] = useState<boolean>(false)
	const [exportLoading, setExportLoading] = useState<boolean>(false)
	const [selectedId, setSelectedId] = useState<string | null>(null)
	const [rowSelection, setRowSelection] = useState({})
	const prefetchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

	const { selectedIds, getSelectedCount, clearSelection } = useWorkOrderSelectionStore()
	const { filters, actions, workOrders } = useWorkOrderFilters()
	const { data, isLoading, refetch, isFetching } = workOrders

	const table = useReactTable<WorkOrder>({
		data: data?.workOrders ?? [],
		getCoreRowModel: getCoreRowModel(),
		onRowSelectionChange: setRowSelection,
		getFilteredRowModel: getFilteredRowModel(),
		columns: getWorkOrderColumns({ setSelectedId, setDialogDetailsOpen, isOtcMember }),

		state: {
			pagination: {
				pageIndex: filters.page - 1,
				pageSize: 10,
			},
			rowSelection,
		},
		manualPagination: true,
		pageCount: data?.pages ?? 0,
	})

	const debouncedPrefetchWorkBookById = useCallback((workOrderId: string) => {
		if (prefetchTimeoutRef.current) {
			clearTimeout(prefetchTimeoutRef.current)
		}

		prefetchTimeoutRef.current = setTimeout(() => {
			queryClient.prefetchQuery({
				queryKey: ["workBooks", { workOrderId }],
				queryFn: (fn) =>
					fetchWorkBookById({
						...fn,
						queryKey: ["workBooks", { workOrderId }],
					}),
				staleTime: 5 * 60 * 1000,
			})

			queryClient.prefetchQuery({
				queryKey: ["workBookMilestones", { workOrderId, showAll: true }],
				queryFn: (fn) =>
					fetchWorkBookMilestones({
						...fn,
						queryKey: ["workBookMilestones", { workOrderId, showAll: true }],
					}),
				staleTime: 5 * 60 * 1000,
			})
		}, 300)
	}, [])

	const handleExportToExcel = useCallback(async () => {
		try {
			setExportLoading(true)

			const res: { workOrders: WorkOrder[] } = await fetch(
				`/api/work-order?page=1&order=desc&orderBy=createdAt&limit=10000&includeEquipments=true`
			).then((res) => res.json())

			if (!res?.workOrders?.length) {
				toast.error("No hay órdenes de trabajo para exportar")
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
					"Fecha estimada de finalización": workOrder.estimatedEndDate
						? format(workOrder.estimatedEndDate, "dd/MM/yyyy", { locale: es })
						: "N/A",
					"Empresa": workOrder.company?.name,
					"Supervisor": workOrder.supervisor?.name + " " + workOrder.supervisor?.email,
					"Equipos": workOrder.equipments?.map((equipment) => equipment.name).join(", "),
					"Cantidad de actividades": workOrder._count.workBookEntries,
				}))
			)

			XLSX.utils.book_append_sheet(workbook, worksheet, "Órdenes de Trabajo")
			XLSX.writeFile(workbook, "ordenes-de-trabajo.xlsx")
			toast.success("Órdenes de trabajo exportadas exitosamente")
		} catch (error) {
			console.error("[EXPORT_EXCEL]", error)
			toast.error("Error al exportar órdenes de trabajo")
		} finally {
			setExportLoading(false)
		}
	}, [])

	const filterHandlers = useMemo(
		() => ({
			onTypeChange: actions.setTypeFilter,
			onCompanyChange: actions.setCompanyId,
			onStatusChange: actions.setStatusFilter,
			onPriorityChange: actions.setPriorityFilter,
		}),
		[actions]
	)

	const selectedCount = getSelectedCount()

	return (
		<Card id={id}>
			<CardContent className="flex w-full flex-col items-start gap-4">
				<div className="flex w-full flex-wrap items-center gap-2 md:w-full md:flex-row">
					<div className="flex flex-col">
						<h2 className="text-xl font-semibold lg:text-2xl">Lista de Órdenes de Trabajo</h2>
						<p className="text-muted-foreground text-sm">
							Gestión y seguimiento de todas las órdenes
						</p>
					</div>

					{selectedCount > 0 && (
						<>
							<Button size={"sm"} variant="outline" onClick={clearSelection} className="ml-auto">
								<X className="h-4 w-4" />
								Limpiar ({selectedCount})
							</Button>

							<BulkCloseWorkOrdersDialog
								workOrders={selectedIds}
								onSuccess={() => {
									refetch()
									clearSelection()
									toast.success("Órdenes de trabajo cerradas exitosamente")
								}}
							/>
						</>
					)}

					<SearchInput
						value={filters.search}
						setPage={actions.setPage}
						onChange={actions.setSearch}
						className="ml-auto w-full md:w-60"
						placeholder="Buscar por nº de OT, trabajo..."
					/>

					<CalendarDateRangePicker value={filters.dateRange} onChange={actions.setDateRange} />

					<RefreshButton refetch={refetch} isFetching={isFetching} />

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline" className="h-10">
								<FilterIcon />
								Filtros
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent className="w-fit min-w-56" align="start">
							<DropdownMenuLabel>Filtrar</DropdownMenuLabel>

							<DropdownMenuGroup className="flex flex-col gap-1.5">
								<DropdownMenuItem asChild>
									<WorkOrderTypeFilter
										onChange={filterHandlers.onTypeChange}
										value={filters.typeFilter}
									/>
								</DropdownMenuItem>

								<DropdownMenuItem asChild>
									<Suspense fallback={<CompanyFilterLoadingSkeleton />}>
										<WorkOrderCompanyFilterWithData
											value={filters.companyId ?? null}
											onChange={filterHandlers.onCompanyChange}
										/>
									</Suspense>
								</DropdownMenuItem>

								<DropdownMenuItem asChild>
									<WorkOrderStatusFilter
										onChange={filterHandlers.onStatusChange}
										value={filters.statusFilter}
									/>
								</DropdownMenuItem>

								<DropdownMenuItem asChild>
									<WorkOrderPriorityFilter
										value={filters.priorityFilter}
										onChange={filterHandlers.onPriorityChange}
									/>
								</DropdownMenuItem>

								<DropdownMenuItem asChild>
									<WorkOrderHasRequestClousureFilter
										value={filters.onlyWithRequestClousure}
										onChange={actions.setOnlyWithRequestClousure}
									/>
								</DropdownMenuItem>

								<DropdownMenuItem asChild>
									<OrderByButton
										className="w-full"
										onChange={(orderBy, order) => {
											actions.setOrderBy(orderBy)
											actions.setOrder(order)
										}}
									/>
								</DropdownMenuItem>
							</DropdownMenuGroup>
						</DropdownMenuContent>
					</DropdownMenu>

					<Button
						variant="outline"
						onClick={actions.resetFilters}
						className="h-10 border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white"
					>
						<FilterXIcon />
						Limpiar Filtros
					</Button>

					<Button
						size={"lg"}
						onClick={handleExportToExcel}
						className="bg-orange-600 hover:bg-orange-700"
					>
						{exportLoading ? <Spinner /> : <FileSpreadsheetIcon className="h-4 w-4" />}
						Exportar
					</Button>
				</div>

				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => {
									return (
										<TableHead key={header.id}>
											{header.isPlaceholder
												? null
												: flexRender(header.column.columnDef.header, header.getContext())}
										</TableHead>
									)
								})}
							</TableRow>
						))}
					</TableHeader>

					<TableBody>
						{isLoading || isFetching ? (
							Array.from({ length: 10 }).map((_, index) => (
								<TableRow key={index}>
									<TableCell className="" colSpan={17}>
										<Skeleton className="h-16 min-w-full" />
									</TableCell>
								</TableRow>
							))
						) : table.getRowModel().rows.length === 0 ? (
							<TableRow>
								<TableCell colSpan={17} className="h-20 text-center">
									<div className="flex items-center justify-center gap-2">
										<InfoIcon className="size-4" />
										No se encontraron resultados.
									</div>
								</TableCell>
							</TableRow>
						) : (
							table.getRowModel().rows.map((row) => (
								<TableRow
									key={row.id}
									data-state={row.getIsSelected() && "selected"}
									onMouseEnter={() => debouncedPrefetchWorkBookById(row.original.id)}
								>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id} className="font-medium">
											{flexRender(cell.column.columnDef.cell, cell.getContext())}
										</TableCell>
									))}
								</TableRow>
							))
						)}
					</TableBody>
				</Table>

				<TablePagination
					table={table}
					isLoading={isLoading}
					total={data?.total ?? 0}
					pageCount={data?.pages ?? 0}
					onPageChange={actions.setPage}
					className="border-orange-600 text-orange-600 hover:bg-orange-600"
				/>
			</CardContent>

			{selectedId && (
				<WorkOrderDetailsDialog
					workOrderId={selectedId}
					open={dialogDetailsOpen}
					setOpen={setDialogDetailsOpen}
				/>
			)}
		</Card>
	)
}
