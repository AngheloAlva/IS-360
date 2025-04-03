import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table"

import { TablePagination } from "@/components/ui/table-pagination"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
	Table,
	TableRow,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
} from "@/components/ui/table"

interface WorkBookDataTableProps<TData, TValue> {
	data: TData[]
	pageSize: number
	pageCount: number
	pageIndex: number
	isLoading?: boolean
	columns: ColumnDef<TData, TValue>[]
	onPageChange: (page: number) => void
}

export function WorkBookDataTable<TData, TValue>({
	data,
	columns,
	pageSize,
	pageCount,
	onPageChange,
	isLoading = false,
}: WorkBookDataTableProps<TData, TValue>) {
	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		manualPagination: true,
		pageCount,
	})

	return (
		<div className="space-y-4">
			<Card>
				<CardContent>
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
							{isLoading
								? Array.from({ length: pageSize }).map((_, index) => (
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
				</CardContent>
			</Card>

			<TablePagination table={table} pageCount={pageCount} onPageChange={onPageChange} />
		</div>
	)
}
