"use client"

import { useState } from "react"
import {
	ColumnDef,
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
import { Card } from "@/components/ui/card"
import {
	Table,
	TableRow,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
} from "@/components/ui/table"

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[]
	isLoading: boolean
	data: TData[]
}

export function DataTable<TData, TValue>({
	columns,
	data,
	isLoading,
}: DataTableProps<TData, TValue>) {
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
	const [sorting, setSorting] = useState<SortingState>([])

	const table = useReactTable({
		data,
		columns,
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
		<section className="flex w-full flex-col items-start gap-4">
			<div className="flex w-fit flex-col flex-wrap items-start gap-2 md:w-full md:flex-row">
				<h2 className="text-text- text-2xl font-semibold">Lista de Empresas</h2>

				<Input
					type="text"
					className="ml-auto w-fit"
					placeholder="Filtrar por Nombre..."
					value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
					onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
				/>

				<Input
					className="w-fit"
					placeholder="Filtrar por RUT..."
					value={(table.getColumn("rut")?.getFilterValue() as string) ?? ""}
					onChange={(event) => table.getColumn("rut")?.setFilterValue(event.target.value)}
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
						{isLoading ? (
							Array.from({ length: 10 }).map((_, index) => (
								<TableRow key={index}>
									<TableCell className="">
										<Skeleton className="h-9 min-w-full" />
									</TableCell>
									<TableCell className="">
										<Skeleton className="h-9 min-w-full" />
									</TableCell>
									<TableCell className="">
										<Skeleton className="h-9 min-w-full" />
									</TableCell>
									<TableCell className="">
										<Skeleton className="h-9 min-w-full" />
									</TableCell>
									<TableCell className="">
										<Skeleton className="h-9 min-w-full" />
									</TableCell>
								</TableRow>
							))
						) : table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
											{flexRender(cell.column.columnDef.cell, cell.getContext())}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={columns.length} className="h-24 text-center">
									No hay datos
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</Card>

			<div className="flex w-full items-center justify-end space-x-2">
				<Button
					variant="outline"
					size="sm"
					className="bg-white"
					onClick={() => table.previousPage()}
					disabled={!table.getCanPreviousPage()}
				>
					Anterior
				</Button>

				<Button
					variant="outline"
					size="sm"
					className="bg-white"
					onClick={() => table.nextPage()}
					disabled={!table.getCanNextPage()}
				>
					Siguiente
				</Button>
			</div>
		</section>
	)
}
