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

import { useCompanyFilters } from "../../hooks/use-company-filters"
import { CompanyColumns } from "../../columns/company-columns"

import { TablePagination } from "@/shared/components/ui/table-pagination"
import { Card, CardContent } from "@/shared/components/ui/card"
import RefreshButton from "@/shared/components/RefreshButton"
import OrderByButton from "@/shared/components/OrderByButton"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { Input } from "@/shared/components/ui/input"
import {
	Table,
	TableRow,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
} from "@/shared/components/ui/table"

export function CompanyTable() {
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
	const [sorting, setSorting] = useState<SortingState>([])

	const {
		companies: { isLoading, refetch, isFetching, data },
		actions,
		filters,
	} = useCompanyFilters()

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
				pageIndex: filters.page - 1,
				pageSize: 10,
			},
		},
		manualPagination: true,
		pageCount: data?.pages ?? 0,
	})

	return (
		<Card id="company-table">
			<CardContent className="flex w-full flex-col items-start gap-4">
				<div className="flex w-fit flex-col flex-wrap items-start gap-2 md:w-full md:flex-row">
					<div className="flex flex-col">
						<h2 className="text-text- text-2xl font-semibold">Lista de Empresas</h2>
						<p className="text-muted-foreground text-sm">Lista de todas las empresas</p>
					</div>

					<div className="ml-auto flex items-center gap-2">
						<Input
							onChange={(e) => {
								actions.setSearch(e.target.value)
								actions.setPage(1)
							}}
							value={filters.search}
							placeholder="Buscar por Nombre o RUT..."
							className="bg-background ml-auto w-fit lg:w-72"
						/>

						<OrderByButton
							className="w-full md:w-fit"
							onChange={(orderBy, order) => {
								actions.setOrderBy(orderBy)
								actions.setOrder(order)
							}}
						/>

						<RefreshButton refetch={refetch} isFetching={isFetching} />
					</div>
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
										<TableCell colSpan={8}>
											<Skeleton className="h-14 min-w-full" />
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

				<TablePagination
					table={table}
					isLoading={isLoading}
					onPageChange={actions.setPage}
					total={data?.total ?? 0}
					pageCount={data?.pages ?? 0}
				/>
			</CardContent>
		</Card>
	)
}
