"use client"

import { ChevronDown, Plus } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import {
	flexRender,
	SortingState,
	useReactTable,
	getCoreRowModel,
	ColumnFiltersState,
	getFilteredRowModel,
	getPaginationRowModel,
} from "@tanstack/react-table"

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
import { useWorkPermits } from "@/hooks/work-permit/use-work-permit"
import { workPermitColumns } from "./work-permit-columns"
import { Card } from "@/components/ui/card"
import { TablePagination } from "@/components/ui/table-pagination"
import { WorkPermitStatusOptions } from "@/lib/consts/work-permit-status"
import RefreshButton from "@/components/shared/RefreshButton"

export function WorkPermitDataTable({ companyId }: { companyId: string }) {
	const [page, setPage] = useState(1)
	const [search, setSearch] = useState("")
	const [sorting, setSorting] = useState<SortingState>([])
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
	const [statusFilter, setStatusFilter] = useState<string | null>(null)

	const { data, isLoading, refetch, isFetching } = useWorkPermits({
		page,
		search,
		limit: 10,
		companyId,
		statusFilter,
		dateRange: null,
	})

	const table = useReactTable({
		data: data?.workPermits ?? [],
		columns: workPermitColumns,
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		onColumnFiltersChange: setColumnFilters,
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		state: {
			sorting,
			columnFilters,
		},
	})

	return (
		<section className="flex w-full flex-col items-start gap-2">
			<div className="flex w-full flex-wrap items-end justify-start gap-2 md:w-full md:flex-row">
				<div className="flex items-center gap-2">
					<Input
						onChange={(e) => {
							setSearch(e.target.value)
							setPage(1)
						}}
						type="text"
						className="bg-background w-full sm:w-64"
						placeholder="Buscar por número de OT, trabajo, ubicación..."
						value={search}
					/>
				</div>

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

				<RefreshButton refetch={refetch} isFetching={isFetching} />

				<Link href="/dashboard/permiso-de-trabajo/agregar">
					<Button>
						Nuevo Permiso de Trabajo
						<Plus className="ml-1" />
					</Button>
				</Link>
			</div>

			<Card className="w-full max-w-full rounded-md p-1.5">
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
											<Skeleton className="h-10 min-w-full" />
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
