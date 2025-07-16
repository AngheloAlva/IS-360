"use client"

import { ChevronDown, FileSpreadsheetIcon } from "lucide-react"
import { DateRange } from "react-day-picker"
import { useState } from "react"
import { toast } from "sonner"
import {
	flexRender,
	SortingState,
	useReactTable,
	VisibilityState,
	getCoreRowModel,
	ColumnFiltersState,
	getFilteredRowModel,
} from "@tanstack/react-table"

import { fetchWorkBookMilestones } from "@/project/work-order/hooks/use-work-book-milestones"
import { useWorkOrders, WorkOrder } from "@/project/work-order/hooks/use-work-order"
import { fetchWorkBookById } from "@/project/work-order/hooks/use-work-book-by-id"
import { WorkOrderPriorityLabels, WorkOrderPriorityOptions } from "@/lib/consts/work-order-priority"
import { WorkOrderStatusOptions } from "@/lib/consts/work-order-status"
import { useCompanies } from "@/project/company/hooks/use-companies"
import { WorkOrderTypeOptions } from "@/lib/consts/work-order-types"
import { WorkOrderCAPEXLabels } from "@/lib/consts/work-order-capex"
import { useDebounce } from "@/shared/hooks/useDebounce"
import { queryClient } from "@/lib/queryClient"

import OrderByButton, { type Order, type OrderBy } from "@/shared/components/OrderByButton"
import { CalendarDateRangePicker } from "@/shared/components/ui/date-range-picker"
import { TablePagination } from "@/shared/components/ui/table-pagination"
import { workOrderColumns } from "../../columns/work-order-columns"
import { Card, CardContent } from "@/shared/components/ui/card"
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
	Select,
	SelectItem,
	SelectLabel,
	SelectGroup,
	SelectTrigger,
	SelectContent,
	SelectSeparator,
} from "@/shared/components/ui/select"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
	DropdownMenuCheckboxItem,
} from "@/shared/components/ui/dropdown-menu"

interface WorkOrderTableProps {
	id?: string
}

export function WorkOrderTable({ id }: WorkOrderTableProps) {
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
	const [priorityFilter, setPriorityFilter] = useState<string | null>(null)
	const [statusFilter, setStatusFilter] = useState<string | null>(null)
	const [exportLoading, setExportLoading] = useState<boolean>(false)
	const [dateRange, setDateRange] = useState<DateRange | null>(null)
	const [typeFilter, setTypeFilter] = useState<string | null>(null)
	const [companyId, setCompanyId] = useState<string | null>(null)
	const [orderBy, setOrderBy] = useState<OrderBy>("createdAt")
	const [sorting, setSorting] = useState<SortingState>([])
	const [rowSelection, setRowSelection] = useState({})
	const [order, setOrder] = useState<Order>("desc")
	const [search, setSearch] = useState("")
	const [page, setPage] = useState(1)

	const { data: companies } = useCompanies({
		limit: 1000,
	})

	const debouncedSearch = useDebounce(search)

	const { data, isLoading, refetch, isFetching } = useWorkOrders({
		page,
		order,
		orderBy,
		dateRange,
		companyId,
		limit: 15,
		typeFilter,
		statusFilter,
		priorityFilter,
		search: debouncedSearch,
	})

	const table = useReactTable<WorkOrder>({
		columns: workOrderColumns,
		onSortingChange: setSorting,
		data: data?.workOrders ?? [],
		getCoreRowModel: getCoreRowModel(),
		onColumnFiltersChange: setColumnFilters,
		getFilteredRowModel: getFilteredRowModel(),
		onColumnVisibilityChange: setColumnVisibility,
		onRowSelectionChange: setRowSelection,

		state: {
			sorting,
			columnFilters,
			pagination: {
				pageIndex: page - 1,
				pageSize: 10,
			},
			rowSelection,
			columnVisibility,
		},
		manualPagination: true,
		pageCount: data?.pages ?? 0,
	})

	const prefetchWorkBookById = (workOrderId: string) => {
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
	}

	const handleExportToExcel = async () => {
		try {
			setExportLoading(true)

			const res: { workOrders: WorkOrder[] } = await fetch(
				`/api/work-order?page=1&order=desc&orderBy=createdAt&limit=10000`
			).then((res) => res.json())
			if (!res?.workOrders?.length) {
				toast.error("No hay órdenes de trabajo para exportar")
				return
			}

			const XLSX = await import("xlsx")

			const workbook = XLSX.utils.book_new()
			const worksheet = XLSX.utils.json_to_sheet(
				res?.workOrders.map((workOrder: WorkOrder) => ({
					otNumber: workOrder.otNumber,
					solicitationDate: workOrder.solicitationDate,
					type: workOrder.type,
					status: workOrder.status,
					solicitationTime: workOrder.solicitationTime,
					workRequest: workOrder.workRequest,
					createdAt: workOrder.createdAt,
					capex: WorkOrderCAPEXLabels[workOrder.capex],
					workDescription: workOrder.workDescription,
					priority: WorkOrderPriorityLabels[workOrder.priority],
					workProgressStatus: workOrder.workProgressStatus,
					programDate: workOrder.programDate,
					estimatedHours: workOrder.estimatedHours,
					estimatedDays: workOrder.estimatedDays,
					estimatedEndDate: workOrder.estimatedEndDate,
					equipment: workOrder.equipment.map((equipment) => ({
						id: equipment.id,
						name: equipment.name,
					})),
					company: workOrder.company?.name,
					supervisor: workOrder.supervisor?.name + " " + workOrder.supervisor?.email,
					responsible: workOrder.responsible?.name + " " + workOrder.responsible?.email,
					_count: workOrder._count.workEntries,
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
	}

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

					<SearchInput
						value={search}
						onChange={setSearch}
						className="ml-auto w-full md:w-72"
						placeholder="Buscar por número de OT, trabajo..."
					/>

					<RefreshButton refetch={refetch} isFetching={isFetching} />
				</div>

				<div className="flex w-full flex-wrap items-center justify-start gap-2 md:w-full md:flex-row">
					<Button
						onClick={handleExportToExcel}
						disabled={isLoading || exportLoading || !data?.workOrders?.length}
						className="hidden cursor-pointer gap-1 bg-orange-500 text-white transition-all hover:scale-105 hover:bg-orange-600 hover:text-white md:flex"
					>
						{exportLoading ? <Spinner /> : <FileSpreadsheetIcon className="h-4 w-4" />}
						Exportar
					</Button>

					<Select
						onValueChange={(value) => {
							if (value === "all") {
								setTypeFilter(null)
							} else {
								setTypeFilter(value)
							}
						}}
						value={typeFilter ?? "all"}
					>
						<SelectTrigger className="border-input bg-background hover:bg-input w-full border transition-colors sm:w-fit">
							Tipo OT
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								<SelectLabel>Tipo de obra</SelectLabel>
								<SelectSeparator />
								<SelectItem value="all">Todos</SelectItem>
								{WorkOrderTypeOptions.map((type) => (
									<SelectItem key={type.value} value={type.value}>
										{type.label}
									</SelectItem>
								))}
							</SelectGroup>
						</SelectContent>
					</Select>

					<Select
						onValueChange={(value) => {
							if (value === "all") {
								setCompanyId(null)
							} else {
								setCompanyId(value)
							}
						}}
						value={companyId ?? "all"}
					>
						<SelectTrigger className="border-input bg-background hover:bg-input w-full border transition-colors sm:w-fit">
							Empresa
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								<SelectLabel>Empresa</SelectLabel>
								<SelectSeparator />
								<SelectItem value="all">Todas</SelectItem>
								{companies?.companies?.map((company) => (
									<SelectItem key={company.id} value={company.id}>
										{company.name}
									</SelectItem>
								))}
							</SelectGroup>
						</SelectContent>
					</Select>

					<CalendarDateRangePicker value={dateRange} onChange={setDateRange} />

					<Select
						onValueChange={(value) => {
							if (value === "all") {
								setStatusFilter(null)
							} else {
								setStatusFilter(value)
							}
						}}
						value={statusFilter ?? "all"}
					>
						<SelectTrigger className="border-input bg-background hover:bg-input w-full border transition-colors sm:w-fit">
							Estado OT
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								<SelectLabel>Estado</SelectLabel>
								<SelectSeparator />
								<SelectItem value="all">Todos</SelectItem>
								{WorkOrderStatusOptions.map((status) => (
									<SelectItem key={status.value} value={status.value}>
										{status.label}
									</SelectItem>
								))}
							</SelectGroup>
						</SelectContent>
					</Select>

					<Select
						onValueChange={(value) => {
							if (value === "all") {
								setPriorityFilter(null)
							} else {
								setPriorityFilter(value)
							}
						}}
						value={priorityFilter ?? "all"}
					>
						<SelectTrigger className="border-input bg-background hover:bg-input w-full border transition-colors sm:w-fit">
							Prioridad OT
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								<SelectLabel>Prioridad</SelectLabel>
								<SelectSeparator />
								<SelectItem value="all">Todas</SelectItem>

								{WorkOrderPriorityOptions.map((priority) => (
									<SelectItem key={priority.value} value={priority.value}>
										{priority.label}
									</SelectItem>
								))}
							</SelectGroup>
						</SelectContent>
					</Select>

					<OrderByButton
						className="ml-auto"
						onChange={(orderBy, order) => {
							setOrderBy(orderBy)
							setOrder(order)
						}}
					/>

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button className="text-text border-input hover:bg-input bg-background border">
								Columnas <ChevronDown />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							{table
								.getAllColumns()
								.filter((column) => column.getCanHide())
								.map((column) => {
									return (
										<DropdownMenuCheckboxItem
											key={column.id}
											className="capitalize"
											checked={column.getIsVisible()}
											onCheckedChange={(value) => column.toggleVisibility(!!value)}
										>
											{(column.columnDef.header as string) || column.id}
										</DropdownMenuCheckboxItem>
									)
								})}
						</DropdownMenuContent>
					</DropdownMenu>
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
						{isLoading || isFetching
							? Array.from({ length: 10 }).map((_, index) => (
									<TableRow key={index}>
										<TableCell className="" colSpan={17}>
											<Skeleton className="h-16 min-w-full" />
										</TableCell>
									</TableRow>
								))
							: table.getRowModel().rows.map((row) => (
									<TableRow
										key={row.id}
										data-state={row.getIsSelected() && "selected"}
										onMouseEnter={() => prefetchWorkBookById(row.original.id)}
									>
										{row.getVisibleCells().map((cell) => (
											<TableCell key={cell.id} className="font-medium">
												{flexRender(cell.column.columnDef.cell, cell.getContext())}
											</TableCell>
										))}
									</TableRow>
								))}
					</TableBody>
				</Table>

				<TablePagination
					table={table}
					isLoading={isLoading}
					onPageChange={setPage}
					pageCount={data?.pages ?? 0}
					className="border-orange-600 text-orange-600 hover:bg-orange-600"
				/>
			</CardContent>
		</Card>
	)
}
