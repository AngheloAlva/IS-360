"use client"

import { ChevronDown } from "lucide-react"
import { useState } from "react"
import {
	flexRender,
	SortingState,
	useReactTable,
	getCoreRowModel,
	ColumnFiltersState,
	getFilteredRowModel,
	getPaginationRowModel,
} from "@tanstack/react-table"

import { getWorkPermitByCompanyColumns } from "../../columns/work-permit-by-company-columns"
import { useWorkPermits } from "@/project/work-permit/hooks/use-work-permit"
import { WorkPermitStatusOptions } from "@/lib/consts/work-permit-status"
import { TablePagination } from "@/shared/components/ui/table-pagination"
import { Card, CardContent } from "@/shared/components/ui/card"
import RefreshButton from "@/shared/components/RefreshButton"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { Button } from "@/shared/components/ui/button"
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
	SelectValue,
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
import OrderByButton, { Order, OrderBy } from "@/shared/components/OrderByButton"
import SearchInput from "@/shared/components/SearchInput"

export function WorkPermitsTableByCompany({
	companyId,
	userId,
}: {
	companyId: string
	userId: string
}) {
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
	const [statusFilter, setStatusFilter] = useState<string | null>(null)
	const [orderBy, setOrderBy] = useState<OrderBy>("createdAt")
	const [sorting, setSorting] = useState<SortingState>([])
	const [order, setOrder] = useState<Order>("desc")
	const [search, setSearch] = useState("")
	const [page, setPage] = useState(1)

	const { data, isLoading, refetch, isFetching } = useWorkPermits({
		page,
		order,
		search,
		orderBy,
		limit: 15,
		companyId,
		statusFilter,
		dateRange: null,
	})

	const table = useReactTable({
		data: data?.workPermits ?? [],
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		onColumnFiltersChange: setColumnFilters,
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		columns: getWorkPermitByCompanyColumns(userId),
		state: {
			sorting,
			columnFilters,
		},
	})

	return (
		<Card>
			<CardContent className="flex w-full flex-col items-start gap-2">
				<div className="flex w-full flex-wrap items-end justify-start gap-2 md:w-full md:flex-row">
					<SearchInput
						value={search}
						onChange={setSearch}
						inputClassName="w-80"
						placeholder="Buscar por número de OT, trabajo, ubicación..."
					/>

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
						<SelectTrigger className="border-input bg-background w-full border sm:w-fit">
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

					<OrderByButton
						onChange={(orderBy, order) => {
							setOrderBy(orderBy)
							setOrder(order)
						}}
					/>

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

					<RefreshButton refetch={() => refetch()} isFetching={isFetching} />
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
									<TableCell className="" colSpan={10}>
										<Skeleton className="h-10 min-w-full" />
									</TableCell>
								</TableRow>
							))
						) : table.getRowModel().rows.length === 0 ? (
							<TableRow>
								<TableCell colSpan={10} className="h-24 text-center">
									No hay permisos de trabajo
								</TableCell>
							</TableRow>
						) : (
							table.getRowModel().rows.map((row) => (
								<TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
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
					onPageChange={setPage}
					pageCount={data?.pages ?? 0}
					className="border-purple-500 text-purple-500"
				/>
			</CardContent>
		</Card>
	)
}
