"use client"

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

import { MaintenancePlanColumns } from "./maintenance-plan-columns"
import {
	type MaintenancePlan,
	useMaintenancePlans,
} from "@/hooks/maintenance-plans/use-maintenance-plans"

import { TablePagination } from "@/components/ui/table-pagination"
import { Skeleton } from "@/components/ui/skeleton"
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

export function MaintenancePlanDataTable() {
	const [page, setPage] = useState(1)
	const [search, setSearch] = useState("")
	const [sorting, setSorting] = useState<SortingState>([])
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

	const { data, isLoading } = useMaintenancePlans({
		page,
		search,
		limit: 15,
	})

	const table = useReactTable<MaintenancePlan>({
		data: data?.maintenancePlans ?? [],
		columns: MaintenancePlanColumns,
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		onColumnFiltersChange: setColumnFilters,
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		state: {
			sorting,
			columnFilters,
			pagination: {
				pageIndex: page - 1,
				pageSize: 10,
			},
		},
		manualPagination: true,
		pageCount: data?.pages ?? 0,
	})

	return (
		<section className="flex w-full flex-col items-start gap-4">
			<div className="flex w-full flex-col flex-wrap items-start gap-4 md:flex-row md:items-center md:justify-between">
				<div className="flex w-full items-center gap-4">
					<Input
						type="text"
						value={search}
						className="bg-background w-full"
						placeholder="Buscar por nombre, equipo, o descripcion..."
						onChange={(e) => setSearch(e.target.value)}
					/>
				</div>
			</div>

			<Card className="w-full max-w-full overflow-x-scroll rounded-md border p-1.5">
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
										<TableCell colSpan={9}>
											<Skeleton className="h-6.5 min-w-full" />
										</TableCell>
									</TableRow>
								))
							: table.getRowModel().rows.map((row) => (
									<TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
										{row.getVisibleCells().map((cell) => (
											<TableCell key={cell.id}>
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
				onPageChange={setPage}
				pageCount={data?.pages ?? 0}
				isLoading={isLoading}
			/>
		</section>
	)
}
