"use client"

import { ChevronDown, Plus } from "lucide-react"
import { DateRange } from "react-day-picker"
import { useState } from "react"
import Link from "next/link"
import {
	flexRender,
	SortingState,
	useReactTable,
	getCoreRowModel,
	ColumnFiltersState,
	getFilteredRowModel,
	VisibilityState,
} from "@tanstack/react-table"

import { WorkOrderStatusOptions } from "@/lib/consts/work-order-status"
import { WorkOrderTypeOptions } from "@/lib/consts/work-order-types"
import { useWorkOrders, WorkOrder } from "@/hooks/use-work-order"
import { useCompanies } from "@/hooks/use-companies"

import { CalendarDateRangePicker } from "@/components/ui/date-range-picker"
import { TablePagination } from "@/components/ui/table-pagination"
import { workOrderColumns } from "./work-order-columns"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
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

	const { data, isLoading } = useWorkOrders({
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
	return (
		<section className="flex w-full flex-col items-start gap-4">
			<div className="flex w-full items-center justify-between">
				<h1 className="text-text text-2xl font-bold">Lista de Ordenes de Trabajo</h1>

				<Link href="/admin/dashboard/ordenes-de-trabajo/agregar">
					<Button className="text-feature border-feature hover:bg-feature border bg-white hover:text-white">
						<Plus className="h-4 w-4" />
						Agregar Orden de Trabajo
					</Button>
				</Link>
			</div>

			<div className="flex w-full flex-wrap items-end justify-start gap-2 md:w-full md:flex-row">
				<Input
					type="text"
					className="w-full sm:w-64"
					placeholder="Buscar por número de OT, trabajo, ubicación..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
				/>

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
					<SelectTrigger className="border-input w-full border bg-white sm:w-fit">
						<SelectValue placeholder="Tipo de obra" />
					</SelectTrigger>
					<SelectContent>
						<SelectGroup>
							<SelectLabel>Tipo de obra</SelectLabel>
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
					<SelectTrigger className="border-input w-full border bg-white sm:w-fit">
						<SelectValue placeholder="Empresa" />
					</SelectTrigger>
					<SelectContent>
						<SelectGroup>
							<SelectLabel>Empresa</SelectLabel>
							<SelectItem value="all">Todas las empresas</SelectItem>
							{companies?.map((company) => (
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
					<SelectTrigger className="border-input w-full border bg-white sm:w-fit">
						<SelectValue placeholder="Estado" />
					</SelectTrigger>
					<SelectContent>
						<SelectGroup>
							<SelectLabel>Estado</SelectLabel>
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
						<Button className="text-text border-input hover:bg-input ml-auto border bg-white">
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

			<Card className="w-full max-w-full overflow-x-scroll rounded-md border-none bg-white p-1.5">
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
						{isLoading
							? Array.from({ length: 10 }).map((_, index) => (
									<TableRow key={index}>
										<TableCell className="" colSpan={15}>
											<Skeleton className="h-9 min-w-full" />
										</TableCell>
									</TableRow>
								))
							: table.getRowModel().rows.map((row) => (
									<TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
										{row.getVisibleCells().map((cell) => (
											<TableCell key={cell.id} className="font-medium">
												{flexRender(cell.column.columnDef.cell, cell.getContext())}
											</TableCell>
										))}
									</TableRow>
								))}
					</TableBody>
				</Table>
			</Card>

			<TablePagination
				table={table}
				isLoading={isLoading}
				onPageChange={setPage}
				pageCount={data?.pages ?? 0}
			/>
		</section>
	)
}
