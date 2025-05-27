"use client"

import { useState } from "react"
import {
	flexRender,
	SortingState,
	useReactTable,
	getCoreRowModel,
	getFilteredRowModel,
	type ColumnFiltersState,
} from "@tanstack/react-table"

import { useVehiclesByCompany, type Vehicle } from "@/hooks/companies/use-vehicles-by-company"
import { VehiclesByCompanyColumns } from "./vehicles-by-company-columns"

import { TablePagination } from "@/components/ui/table-pagination"
import RefreshButton from "@/components/shared/RefreshButton"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import {
	Table,
	TableRow,
	TableCell,
	TableHead,
	TableBody,
	TableHeader,
} from "@/components/ui/table"

export function VehiclesByCompanyDataTable({
	companyId,
}: {
	companyId: string
}): React.ReactElement {
	const [page, setPage] = useState(1)
	const [search, setSearch] = useState("")
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
	const [sorting, setSorting] = useState<SortingState>([])

	const { data, isLoading, refetch, isFetching } = useVehiclesByCompany({
		page,
		search,
		limit: 10,
		companyId,
	})

	const table = useReactTable<Vehicle>({
		data: data?.vehicles ?? [],
		onSortingChange: setSorting,
		columns: VehiclesByCompanyColumns,
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
		<section className="mt-4 flex w-full flex-col items-start gap-4">
			<div className="flex w-full items-center justify-between gap-2">
				<h2 className="text-text mb-4 text-2xl font-bold">Vehículos de la Empresa</h2>

				<div className="flex items-center gap-2">
					<Input
						value={search}
						onChange={(e) => {
							setSearch(e.target.value)
							setPage(1)
						}}
						className="bg-background w-full sm:w-80"
						placeholder="Buscar por Patente, Modelo, Marca..."
					/>
					<RefreshButton refetch={refetch} isFetching={isFetching} />
				</div>
			</div>

			<Card className="w-full max-w-full rounded-md border-none p-1.5">
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
