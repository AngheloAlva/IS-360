/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useMemo } from "react"
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/shared/components/ui/table"
import {
	ColumnDef,
	flexRender,
	getCoreRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	SortingState,
	useReactTable,
} from "@tanstack/react-table"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardFooter } from "@/shared/components/ui/card"
import { ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react"
import { ScrollArea } from "@/shared/components/ui/scroll-area"

interface DataTableProps {
	data: any[]
}

export function DataTable({ data }: DataTableProps) {
	const [sorting, setSorting] = useState<SortingState>([])
	const [pageSize, setPageSize] = useState<number>(10)

	const columns = useMemo(() => {
		if (data.length === 0) return []

		return Object.keys(data[0]).map((key) => ({
			accessorKey: key,
			header: ({ column }) => {
				return (
					<Button
						variant="ghost"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
						className="p-0 hover:bg-transparent"
					>
						{key}
						<ArrowUpDown className="ml-2 h-4 w-4" />
					</Button>
				)
			},
			cell: ({ row }) => {
				const value = row.getValue(key)
				return formatCellValue(value)
			},
		})) as ColumnDef<any>[]
	}, [data])

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		onSortingChange: setSorting,
		getSortedRowModel: getSortedRowModel(),
		state: {
			sorting,
		},
		initialState: {
			pagination: {
				pageSize,
			},
		},
	})

	// No data state
	if (data.length === 0) {
		return (
			<Card>
				<CardContent className="p-6 text-center">
					<p className="text-muted-foreground">No hay datos disponibles</p>
				</CardContent>
			</Card>
		)
	}

	return (
		<Card>
			<ScrollArea className="max-h-[500px]">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<TableHead key={header.id}>
										{header.isPlaceholder
											? null
											: flexRender(header.column.columnDef.header, header.getContext())}
									</TableHead>
								))}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows?.length ? (
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
									Sin resultados.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</ScrollArea>

			<CardFooter className="border-t p-2">
				<div className="flex w-full items-center justify-between">
					<div className="flex items-center gap-2">
						<p className="text-muted-foreground text-sm">Filas por página:</p>
						<select
							value={pageSize}
							onChange={(e) => {
								setPageSize(Number(e.target.value))
								table.setPageSize(Number(e.target.value))
							}}
							className="border-input bg-background h-8 w-16 rounded-md border px-2 text-sm"
						>
							{[5, 10, 20, 50].map((size) => (
								<option key={size} value={size}>
									{size}
								</option>
							))}
						</select>
					</div>

					<div className="flex items-center space-x-2">
						<p className="text-muted-foreground text-sm">
							Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
						</p>
						<Button
							variant="outline"
							size="icon"
							onClick={() => table.previousPage()}
							disabled={!table.getCanPreviousPage()}
						>
							<ChevronLeft className="h-4 w-4" />
						</Button>
						<Button
							variant="outline"
							size="icon"
							onClick={() => table.nextPage()}
							disabled={!table.getCanNextPage()}
						>
							<ChevronRight className="h-4 w-4" />
						</Button>
					</div>
				</div>
			</CardFooter>
		</Card>
	)
}

// Formatea el valor de una celda según su tipo
function formatCellValue(value: any): React.ReactNode {
	if (value === null || value === undefined) {
		return <span className="text-muted-foreground italic">-</span>
	}

	if (typeof value === "boolean") {
		return value ? "Sí" : "No"
	}

	if (value instanceof Date) {
		return value.toLocaleString()
	}

	if (typeof value === "object") {
		return JSON.stringify(value)
	}

	return value.toString()
}
