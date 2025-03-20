"use client"

import { useState } from "react"
import Link from "next/link"
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
import { Plus } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

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
		<section className="flex w-full flex-col items-start">
			<div className="flex w-fit flex-col flex-wrap items-start gap-2 py-4 md:w-full md:flex-row">
				<Input
					type="text"
					className="w-fit"
					placeholder="Numero de OT..."
					value={(table.getColumn("otNumber")?.getFilterValue() as string) ?? ""}
					onChange={(event) => table.getColumn("otNumber")?.setFilterValue(event.target.value)}
				/>

				<Link href="/dashboard/admin/ordenes-de-trabajo/agregar" className="md:ml-auto">
					<Button size={"lg"}>
						Nueva Orden de Trabajo
						<Plus className="ml-1" />
					</Button>
				</Link>
			</div>

			<div className="w-full max-w-full overflow-x-scroll rounded-md border">
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
			</div>

			<div className="flex items-center justify-end space-x-2 py-4">
				<Button
					variant="outline"
					size="sm"
					onClick={() => table.previousPage()}
					disabled={!table.getCanPreviousPage()}
				>
					Anterior
				</Button>

				<Button
					variant="outline"
					size="sm"
					onClick={() => table.nextPage()}
					disabled={!table.getCanNextPage()}
				>
					Siguiente
				</Button>
			</div>
		</section>
	)
}
