import { useState } from "react"
import {
	flexRender,
	SortingState,
	useReactTable,
	getCoreRowModel,
	getFilteredRowModel,
	type ColumnFiltersState,
} from "@tanstack/react-table"

import { useWorkBooks, WorkBook } from "@/hooks/work-orders/use-work-books"
import { workBookColumns } from "./work-book-columns"

import { TablePagination } from "@/components/ui/table-pagination"
import RefreshButton from "@/components/shared/RefreshButton"
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

export function WorkBookDataTable() {
	const [page, setPage] = useState(1)
	const [search, setSearch] = useState("")
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
	const [sorting, setSorting] = useState<SortingState>([])

	const { data, isLoading, refetch, isFetching } = useWorkBooks({
		page,
		search,
		limit: 15,
	})

	const table = useReactTable<WorkBook>({
		data: data?.workBooks ?? [],
		columns: workBookColumns,
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
		<section className="mt-4 flex w-full flex-col items-start gap-4">
			<div className="flex w-full flex-col items-start justify-between lg:flex-row">
				<h2 className="text-text text-2xl font-bold">Lista de Libros de Obras</h2>

				<div className="my-4 flex flex-col gap-2 lg:my-0 lg:flex-row">
					<Input
						type="text"
						value={search}
						className="bg-background w-full sm:w-80"
						placeholder="Buscar por nombre o número de folio..."
						onChange={(e) => setSearch(e.target.value)}
					/>

					<RefreshButton refetch={refetch} isFetching={isFetching} />
				</div>
			</div>

			<Card className="w-full max-w-full rounded-md border-none p-1.5">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<TableHead key={header.id}>
										{flexRender(header.column.columnDef.header, header.getContext())}
									</TableHead>
								))}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{isLoading || isFetching
							? Array.from({ length: 15 }).map((_, index) => (
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
				onPageChange={setPage}
				pageCount={data?.pages ?? 0}
				isLoading={isLoading}
			/>
		</section>
	)
}
