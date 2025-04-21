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

import { useWorkEntries, WorkEntry } from "@/hooks/use-work-entries"
import { WorkEntryColumns } from "./work-entry-columns"
import { WorkBookEntryDetails } from "./WorkBookEntryDetails"

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

export default function WorkBookEntriesTable({
	workOrderId,
}: {
	workOrderId: string
}): React.ReactElement {
	const [selectedEntry, setSelectedEntry] = useState<WorkEntry | null>(null)
	const [page, setPage] = useState(1)
	const [search, setSearch] = useState("")
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
	const [sorting, setSorting] = useState<SortingState>([])

	const { data, isLoading } = useWorkEntries({
		page,
		search,
		limit: 10,
		workOrderId,
	})

	const table = useReactTable<WorkEntry>({
		data: data?.entries ?? [],
		columns: WorkEntryColumns,
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
		<section className="flex w-full flex-col gap-4">
			<div className="flex w-full flex-wrap items-end justify-start gap-2 md:w-full md:flex-row">
				<Input
					type="text"
					value={search}
					className="bg-background w-full sm:w-96"
					onChange={(e) => setSearch(e.target.value)}
					placeholder="Buscar por nombre de actividad o comentarios..."
				/>
			</div>

			<Card className="w-full p-1.5">
				{isLoading ? (
					<div className="space-y-2 p-4">
						<Skeleton className="h-8 w-full" />
						<Skeleton className="h-8 w-full" />
						<Skeleton className="h-8 w-full" />
						<Skeleton className="h-8 w-full" />
						<Skeleton className="h-8 w-full" />
						<Skeleton className="h-8 w-full" />
						<Skeleton className="h-8 w-full" />
						<Skeleton className="h-8 w-full" />
						<Skeleton className="h-8 w-full" />
					</div>
				) : (
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
							{table.getRowModel().rows?.length ? (
								table.getRowModel().rows.map((row) => (
									<TableRow
										key={row.id}
										data-state={row.getIsSelected() && "selected"}
										className="hover:bg-muted/50 cursor-pointer"
										onClick={() => setSelectedEntry(row.original)}
									>
										{row.getVisibleCells().map((cell) => (
											<TableCell key={cell.id} className="font-medium">
												{flexRender(cell.column.columnDef.cell, cell.getContext())}
											</TableCell>
										))}
									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell colSpan={WorkEntryColumns.length} className="h-24 text-center">
										No hay entradas
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				)}
			</Card>

			<TablePagination<WorkEntry>
				table={table}
				pageCount={data?.pages ?? 0}
				onPageChange={setPage}
				isLoading={isLoading}
			/>

			<WorkBookEntryDetails
				entry={selectedEntry}
				isLoading={false}
				onClose={() => setSelectedEntry(null)}
			/>
		</section>
	)
}
