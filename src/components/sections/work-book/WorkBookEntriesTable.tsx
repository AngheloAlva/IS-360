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

import { useWorkEntries, WorkEntry } from "@/hooks/work-orders/use-work-entries"
import { WorkBookEntryDetails } from "./WorkBookEntryDetails"
import { WorkEntryColumns } from "./work-entry-columns"

import { TablePagination } from "@/components/ui/table-pagination"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import {
	Table,
	TableRow,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
} from "@/components/ui/table"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"

export default function WorkBookEntriesTable({
	workOrderId,
}: {
	workOrderId: string
}): React.ReactElement {
	const [selectedEntry, setSelectedEntry] = useState<WorkEntry | null>(null)
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
	const [milestone, setMilestone] = useState<string | null>(null)
	const [sorting, setSorting] = useState<SortingState>([])
	const [search, setSearch] = useState("")
	const [page, setPage] = useState(1)

	const { data, isLoading } = useWorkEntries({
		page,
		search,
		milestone,
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
		<div className="space-y-4">
			<div className="flex w-full flex-wrap items-center justify-start gap-2 md:w-full md:flex-row">
				<Input
					type="text"
					value={search}
					className="bg-background w-full sm:w-96"
					onChange={(e) => setSearch(e.target.value)}
					placeholder="Buscar por nombre de actividad o comentarios..."
				/>

				<Select
					onValueChange={(value) => {
						if (value === "all") {
							setMilestone(null)
						} else {
							setMilestone(value)
						}
					}}
					value={milestone === null ? "all" : milestone}
				>
					<SelectTrigger className="bg-background w-full sm:w-fit">
						<SelectValue placeholder="Seleccionar hito" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">Todos los hitos</SelectItem>

						{data?.milestones.map((milestone) => (
							<SelectItem key={milestone.id} value={milestone.id}>
								{milestone.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

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

			<TablePagination<WorkEntry>
				table={table}
				isLoading={isLoading}
				onPageChange={setPage}
				pageCount={data?.pages ?? 0}
				className="border-orange-600 text-orange-600 hover:bg-orange-600"
			/>

			<WorkBookEntryDetails
				isLoading={false}
				entry={selectedEntry}
				onClose={() => setSelectedEntry(null)}
			/>
		</div>
	)
}
