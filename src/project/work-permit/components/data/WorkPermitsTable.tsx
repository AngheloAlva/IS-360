"use client"

import { useState } from "react"
import {
	flexRender,
	useReactTable,
	getCoreRowModel,
	getSortedRowModel,
	type SortingState,
	getFilteredRowModel,
	getPaginationRowModel,
} from "@tanstack/react-table"

import { useWorkPermits } from "@/project/work-permit/hooks/use-work-permit"
import { WorkPermitColumns } from "../../columns/work-permit-columns"

import { TablePagination } from "@/shared/components/ui/table-pagination"
import { Card, CardContent } from "@/shared/components/ui/card"
import RefreshButton from "@/shared/components/RefreshButton"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { Input } from "@/shared/components/ui/input"
import {
	Table,
	TableRow,
	TableCell,
	TableBody,
	TableHead,
	TableHeader,
} from "@/shared/components/ui/table"

export default function WorkPermitsTable() {
	const [page, setPage] = useState(1)
	const [search, setSearch] = useState("")
	const [sorting, setSorting] = useState<SortingState>([])
	const { data, isLoading, refetch, isFetching } = useWorkPermits({
		page,
		search,
		limit: 10,
		companyId: null,
		dateRange: null,
		statusFilter: null,
	})

	const table = useReactTable({
		data: data?.workPermits ?? [],
		columns: WorkPermitColumns,
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		state: {
			sorting,
		},
		manualPagination: true,
		pageCount: data?.pages ?? 1,
	})

	return (
		<Card>
			<CardContent className="flex w-full flex-col items-start gap-4">
				<div className="flex w-full flex-col flex-wrap items-start gap-4 md:flex-row md:items-center md:justify-between">
					<div className="flex w-full items-center justify-between gap-4">
						<Input
							placeholder="Buscar permisos..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="h-8 w-[150px] lg:w-[250px]"
						/>

						<RefreshButton refetch={refetch} isFetching={isFetching} />
					</div>
				</div>

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
						{isLoading || isFetching ? (
							Array.from({ length: 15 }).map((_, index) => (
								<TableRow key={index}>
									<TableCell colSpan={11}>
										<Skeleton className="h-6.5 min-w-full" />
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
								<TableCell colSpan={WorkPermitColumns.length} className="h-24 text-center">
									No se encontraron resultados.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>

				{data && (
					<TablePagination
						table={table}
						pageCount={data.pages}
						onPageChange={setPage}
						isLoading={isLoading}
						className="border-rose-600 text-rose-600 hover:bg-rose-600"
					/>
				)}
			</CardContent>
		</Card>
	)
}
