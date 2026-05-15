"use client"

import { useState } from "react"
import {
	useReactTable,
	getCoreRowModel,
	flexRender,
	type ColumnDef,
} from "@tanstack/react-table"
import { ArrowUpIcon, ArrowDownIcon, ArrowUpDownIcon } from "lucide-react"

import type { DrillDownRow, DrillDownSortBy, DrillDownSortDir } from "@/project/maintenance-plan/types/kpi-drill-down"
import { useKpiDrillDownActions } from "@/project/maintenance-plan/stores/kpi-drill-down.store"
import { TablePagination } from "@/shared/components/ui/table-pagination"
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/shared/components/ui/table"
import { cn } from "@/lib/utils"

// ─── Sortable column IDs ───────────────────────────────────────────────────────

const SORTABLE_COLUMNS: DrillDownSortBy[] = [
	"delayDays",
	"estimatedEndDate",
	"endDate",
	"otNumber",
]

const SORT_COLUMN_MAP: Record<string, DrillDownSortBy> = {
	code: "otNumber",
	scheduledDate: "estimatedEndDate",
	endDate: "endDate",
	delayDays: "delayDays",
}

// ─── Props ─────────────────────────────────────────────────────────────────────

interface DrillDownTableProps {
	rows: DrillDownRow[]
	total: number
	page: number
	pageSize: number
	sortBy: DrillDownSortBy
	sortDir: DrillDownSortDir
	isLoading?: boolean
	columns: ColumnDef<DrillDownRow>[]
	onRowClick: (row: DrillDownRow) => void
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function DrillDownTable({
	rows,
	total,
	page,
	pageSize,
	sortBy,
	sortDir,
	isLoading,
	columns,
	onRowClick,
}: DrillDownTableProps) {
	const { setPage, setSort } = useKpiDrillDownActions()

	const table = useReactTable<DrillDownRow>({
		data: rows,
		columns,
		getCoreRowModel: getCoreRowModel(),
		manualPagination: true,
		manualSorting: true,
		state: {
			pagination: {
				pageIndex: page - 1,
				pageSize,
			},
		},
		pageCount: Math.ceil(total / pageSize),
		onPaginationChange: () => undefined, // managed via store
	})

	function handleSort(accessorKey: string) {
		const mapped = SORT_COLUMN_MAP[accessorKey]
		if (!mapped) return

		if (sortBy === mapped) {
			setSort(mapped, sortDir === "asc" ? "desc" : "asc")
		} else {
			setSort(mapped, "desc")
		}
	}

	function SortIcon({ accessorKey }: { accessorKey: string }) {
		const mapped = SORT_COLUMN_MAP[accessorKey]
		if (!mapped) return null
		if (sortBy !== mapped) return <ArrowUpDownIcon className="ml-1 inline size-3 opacity-40" />
		return sortDir === "asc" ? (
			<ArrowUpIcon className="ml-1 inline size-3" />
		) : (
			<ArrowDownIcon className="ml-1 inline size-3" />
		)
	}

	return (
		<div className="flex flex-col gap-3">
			<div className="overflow-x-auto rounded-md border">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id} className="hover:bg-transparent">
								{headerGroup.headers.map((header) => {
									// ColumnDef may not expose accessorKey at runtime — narrow via 'id' fallback
								const colDef = header.column.columnDef as { accessorKey?: string }
								const accessorKey = colDef.accessorKey
								const isSortable = accessorKey ? !!SORT_COLUMN_MAP[accessorKey] : false

									return (
										<TableHead
											key={header.id}
											className={cn(isSortable && "cursor-pointer select-none")}
											onClick={isSortable && accessorKey ? () => handleSort(accessorKey) : undefined}
										>
											{header.isPlaceholder
												? null
												: flexRender(header.column.columnDef.header, header.getContext())}
											{accessorKey && <SortIcon accessorKey={accessorKey} />}
										</TableHead>
									)
								})}
							</TableRow>
						))}
					</TableHeader>

					<TableBody>
						{table.getRowModel().rows.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className="text-muted-foreground py-8 text-center"
								>
									No hay OTs para este segmento
								</TableCell>
							</TableRow>
						) : (
							table.getRowModel().rows.map((row) => (
								<TableRow
									key={row.id}
									className={cn("cursor-pointer", isLoading && "pointer-events-none opacity-60")}
									onClick={() => onRowClick(row.original)}
								>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
											{flexRender(cell.column.columnDef.cell, cell.getContext())}
										</TableCell>
									))}
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>

			{total > 0 && (
				<TablePagination
					table={table}
					total={total}
					isLoading={isLoading}
					pageCount={Math.ceil(total / pageSize)}
					onPageChange={setPage}
				/>
			)}
		</div>
	)
}
