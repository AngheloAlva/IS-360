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

import { useWorkEntries, WorkEntry } from "@/project/work-order/hooks/use-work-entries"
import { WorkEntryColumns } from "../../columns/work-entry-columns"
import { WorkBookEntryDetails } from "./WorkBookEntryDetails"

import { TablePagination } from "@/shared/components/ui/table-pagination"
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
import {
	Select,
	SelectItem,
	SelectValue,
	SelectContent,
	SelectTrigger,
} from "@/shared/components/ui/select"
import WorkOrderPDFViewer from "../pdf/WorkOrderPDFViewer"

export default function WorkBookEntriesTable({
	userId,
	workOrderId,
	hasPermission,
	workOrderNumber,
}: {
	userId: string
	workOrderId: string
	hasPermission: boolean
	workOrderNumber: string
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
		limit: 15,
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

				<WorkOrderPDFViewer workOrderId={workOrderId} workOrderNumber={workOrderNumber} />
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
				userId={userId}
				isLoading={false}
				entry={selectedEntry}
				hasPermission={hasPermission}
				onClose={() => setSelectedEntry(null)}
			/>
		</div>
	)
}
