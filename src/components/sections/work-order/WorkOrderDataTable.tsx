"use client"

import { DateRange } from "react-day-picker"
import { ChevronDown, SearchIcon } from "lucide-react"
import { useState } from "react"
import {
	flexRender,
	SortingState,
	useReactTable,
	VisibilityState,
	getCoreRowModel,
	ColumnFiltersState,
	getFilteredRowModel,
} from "@tanstack/react-table"

import { fetchWorkBookMilestones } from "@/hooks/work-orders/use-work-book-milestones"
import { useWorkOrders, WorkOrder } from "@/hooks/work-orders/use-work-order"
import { fetchWorkBookById } from "@/hooks/work-orders/use-work-book-by-id"
import { WorkOrderStatusOptions } from "@/lib/consts/work-order-status"
import { WorkOrderTypeOptions } from "@/lib/consts/work-order-types"
import { useCompanies } from "@/hooks/companies/use-companies"
import { queryClient } from "@/lib/queryClient"

import { CalendarDateRangePicker } from "@/components/ui/date-range-picker"
import { TablePagination } from "@/components/ui/table-pagination"
import RefreshButton from "@/components/shared/RefreshButton"
import { Card, CardContent } from "@/components/ui/card"
import { workOrderColumns } from "./work-order-columns"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
	Table,
	TableRow,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
} from "@/components/ui/table"
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectSeparator,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
	DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"

export function WorkOrderDataTable() {
	const [page, setPage] = useState(1)
	const [search, setSearch] = useState("")
	const [sorting, setSorting] = useState<SortingState>([])
	const [typeFilter, setTypeFilter] = useState<string | null>(null)
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
	const [statusFilter, setStatusFilter] = useState<string | null>(null)
	const [companyId, setCompanyId] = useState<string | null>(null)
	const [dateRange, setDateRange] = useState<DateRange | null>(null)
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
	const [rowSelection, setRowSelection] = useState({})

	const { data: companies } = useCompanies()

	const { data, isLoading, refetch, isFetching } = useWorkOrders({
		page,
		search,
		limit: 10,
		typeFilter,
		statusFilter,
		companyId,
		dateRange,
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

	return (
		<Card>
			<CardContent className="flex w-full flex-col items-start gap-4">
				<div className="flex w-full flex-wrap items-center gap-2 md:w-full md:flex-row">
					<div className="flex flex-col">
						<h2 className="text-2xl font-semibold">Lista de Órdenes de Trabajo</h2>
						<p className="text-muted-foreground text-sm">
							Gestión y seguimiento de todas las órdenes
						</p>
					</div>

					<div className="border-input ml-auto flex items-center rounded-lg border pl-2">
						<SearchIcon className="text-muted-foreground size-4" />
						<Input
							onChange={(e) => {
								setSearch(e.target.value)
								setPage(1)
							}}
							type="text"
							value={search}
							className="w-64 border-none focus-visible:ring-0"
							placeholder="Buscar por número de OT, trabajo..."
						/>
					</div>

					<RefreshButton refetch={refetch} isFetching={isFetching} />
				</div>

				<div className="flex w-full flex-wrap items-center justify-start gap-2 md:w-full md:flex-row">
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
							<SelectValue placeholder="Tipo de obra" />
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								<SelectLabel>Tipo de obra</SelectLabel>
								<SelectSeparator />
								<SelectItem value="all">Todos los tipos</SelectItem>
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
							<SelectValue placeholder="Empresa" />
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								<SelectLabel>Empresa</SelectLabel>
								<SelectSeparator />
								<SelectItem value="all">Todas las empresas</SelectItem>
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
							<SelectValue placeholder="Estado" />
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								<SelectLabel>Estado</SelectLabel>
								<SelectSeparator />
								<SelectItem value="all">Todos los estados</SelectItem>
								{WorkOrderStatusOptions.map((status) => (
									<SelectItem key={status.value} value={status.value}>
										{status.label}
									</SelectItem>
								))}
							</SelectGroup>
						</SelectContent>
					</Select>

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button className="text-text border-input hover:bg-input bg-background ml-auto border">
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
					className="border-orange-600 text-orange-600"
				/>
			</CardContent>
		</Card>
	)
}
