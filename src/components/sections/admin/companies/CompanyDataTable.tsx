"use client"

import { useState } from "react"
import {
	flexRender,
	SortingState,
	useReactTable,
	getCoreRowModel,
	ColumnFiltersState,
	getFilteredRowModel,
} from "@tanstack/react-table"

import { useCompanies } from "@/hooks/use-companies"

import { TablePagination } from "@/components/ui/table-pagination"
import { Skeleton } from "@/components/ui/skeleton"
import { CompanyColumns } from "./company-columns"
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

export function CompanyDataTable() {
	const [page, setPage] = useState(1)
	const [search, setSearch] = useState("")
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
	const [sorting, setSorting] = useState<SortingState>([])

	const { data, isLoading } = useCompanies({
		page,
		search,
		limit: 10,
	})

	const table = useReactTable({
		data: data?.companies ?? [],
		columns: CompanyColumns,
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		onColumnFiltersChange: setColumnFilters,
		getFilteredRowModel: getFilteredRowModel(),
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
			<div className="flex w-fit flex-col flex-wrap items-start gap-2 md:w-full md:flex-row">
				<h2 className="text-text- text-2xl font-semibold">Lista de Empresas</h2>

				<Input
					type="text"
					value={search}
					className="ml-auto w-fit"
					placeholder="Buscar por Nombre o RUT..."
					onChange={(e) => setSearch(e.target.value)}
				/>
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
										<TableCell className="" colSpan={8}>
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
