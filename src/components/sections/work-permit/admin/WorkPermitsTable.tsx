"use client"

import { useState } from "react"
import {
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	SortingState,
	useReactTable,
	flexRender,
} from "@tanstack/react-table"

import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table"
import { TablePagination } from "@/components/ui/table-pagination"
import { workPermitColumns } from "./work-permit-columns"
import { useAdminWorkPermits } from "@/hooks/work-permit/use-admin-work-permits"
import RefreshButton from "@/components/shared/RefreshButton"

export default function WorkPermitsTable() {
	const [page, setPage] = useState(1)
	const [search, setSearch] = useState("")
	const [sorting, setSorting] = useState<SortingState>([])
	const { data, isLoading, refetch, isFetching } = useAdminWorkPermits({
		page,
		search,
		limit: 10,
	})

	const table = useReactTable({
		data: data?.workPermits ?? [],
		columns: workPermitColumns,
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
			<CardHeader>
				<CardTitle>Permisos de Trabajo</CardTitle>
			</CardHeader>
			<div className="flex w-full flex-wrap items-end justify-start gap-2 p-4 md:w-full md:flex-row">
				<div className="flex items-center gap-2">
					<Input
						placeholder="Buscar permisos..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="h-8 w-[150px] lg:w-[250px]"
					/>
					<RefreshButton refetch={refetch} isFetching={isFetching} />
				</div>
			</div>
			<CardContent>
				<div className="rounded-md border">
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
									<TableCell colSpan={workPermitColumns.length} className="h-24 text-center">
										No se encontraron resultados.
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</div>
				{data && (
					<TablePagination
						table={table}
						pageCount={data.pages}
						onPageChange={setPage}
						isLoading={isLoading}
					/>
				)}
			</CardContent>
		</Card>
	)
}
